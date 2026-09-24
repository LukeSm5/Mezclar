export interface ToggleAutoNamesRequest {
    enabled: boolean;
}

export interface RegenerateNameRequest {
    player_id: string;
}

export interface GenerateNameResponse {
    name: string;
}

export interface SubmitNameRequest {
    player_id: string;
    requested_name: string;
}