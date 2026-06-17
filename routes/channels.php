<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('clinic.stats', function ($user) {
    return $user !== null;
});

Broadcast::channel('appointments', function ($user) {
    return $user !== null;
});
