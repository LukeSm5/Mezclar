export interface ToggleAutoNamesRequest {
    session_id: string;
    enabled: boolean;
}

export interface RegenerateNameRequest {
    session_id: string;
    player_id: string;
}

export interface GenerateNameResponse {
    name: string;
}