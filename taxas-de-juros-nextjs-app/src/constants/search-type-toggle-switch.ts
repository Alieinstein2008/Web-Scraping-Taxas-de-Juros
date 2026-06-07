export const TEXT_ON_LEFT_SIDE_OF_TOGGLE_SWITCH: string = 'Anual'; //The variable can be changed without any problem.  
export const TEXT_ON_RIGHT_SIDE_OF_TOGGLE_SWITCH: string = 'Mensal'; //The variable can be changed without any problem.

export const SEARCH_TYPE_TOGGLE_SWITCH = {
    [TEXT_ON_LEFT_SIDE_OF_TOGGLE_SWITCH]: '% a.a.', //Fixed values, should not be changed.
    [TEXT_ON_RIGHT_SIDE_OF_TOGGLE_SWITCH]: '% a.m.' //Fixed values, should not be changed.
} as const;
