<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $contacts = $this->getContacts($user);

        $contacts->map(function ($contact) use ($user) {
            $contact->unread_count = Message::where('sender_id', $contact->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();
            return $contact;
        });

        return Inertia::render('chat/index', [
            'contacts' => $contacts
        ]);
    }

    public function show(User $receiver)
    {
        $userId = Auth::id();

        Message::where('sender_id', $receiver->id)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where(function ($q) use ($userId, $receiver) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', $receiver->id);
        })
            ->orWhere(function ($q) use ($userId, $receiver) {
                $q->where('sender_id', $receiver->id)
                    ->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
        ]);

        $message->load('sender');

        broadcast(new MessageSent($message));

        return response()->json($message);
    }

    private function getContacts(User $user)
    {
        if ($user->hasRole(['admin', 'super_admin'])) {
            return User::where('id', '!=', $user->id)->get(['id', 'name', 'email']);
        }

        $superAdmins = User::role('super_admin')
            ->where('id', '!=', $user->id)
            ->get(['id', 'name', 'email']);

        if ($user->hasRole('doctor')) {
            $assistants = $user->assistants()->get(['users.id', 'users.name', 'users.email']);

            return $assistants->merge($superAdmins);
        }

        if ($user->hasRole('assistant')) {
            $doctors = $user->doctors()->get(['users.id', 'users.name', 'users.email']);

            $otherAssistants = User::role('assistant')
                ->where('id', '!=', $user->id)
                ->get(['id', 'name', 'email']);

            return $doctors->merge($otherAssistants)->merge($superAdmins);
        }

        return collect();
    }

    public function typing(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        broadcast(new UserTyping(Auth::id(), $request->receiver_id));

        return response()->noContent();
    }
}
