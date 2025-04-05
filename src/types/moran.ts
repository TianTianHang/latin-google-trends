
export interface GlobalMoranParams {
    data: number[];
    iso_codes?: string[];
    missing_data_method?: 'drop' | 'interpolate';
}

export interface GlobalMoranResult {
    I: number;
    p_value: number;
    z_score: number;
}

export interface LocalMoranParams {
    data: number[];
    iso_codes?: string[];
    missing_data_method?: 'drop' | 'interpolate';
}

export interface LocalMoranResult {
    I: number[];
    p_values: number[];
    z_scores: number[];
    type:number[]
}
