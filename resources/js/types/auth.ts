import { MedicalProfile, Role } from ".";

export type User = {
    id: number;
    name: string;
    color?: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    
    roles?: Role[];
    medical_profile?: MedicalProfile;
    doctors?: User[];
    assistants?: User[];
    is_taken?: boolean;
    unread_count?: number;
    current_assistant_id?: number | null;
    
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
