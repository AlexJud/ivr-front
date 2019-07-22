export enum Strings {
    TEXT_FOR_SYNTHESIZE = "Текст для синтеза",
    ASR_OPTION = "Опции распознавания",
    ASR_TYPE = "Способ распознавания",
    KEYWORDS = "Ключевые слова",
    VAR_NAME = "Имя переменной куда сохранить распознанное слово по грамматике",
    RAW_VAR_NAME = "Имя переменной куда сохранить слитно распознанное слово",
    GRAMMAR = "Файл с грамматикой",
    ASR_TOOLTIP = "b = Возможность прервать проигрываемый файл (режим barge-in)\n" +
                   "\t и начать распознавание (нельзя перебить=0, можно перебить" + 
                   "\t и обнаружение речи осуществляет ASR движок=1,можно перебить" + 
                   "\t и обнаружение речи осуществляет Asterisk=2)",
    LOAD_GRAMMAR = 'Загрузить новый файл',
    BUILTIN_GRAMMAR = 'Слитное распознавание',
    FILE_GRAMMAR = 'Распознавание по грамматике'
}
export enum CellType {
    INPUT,
    SELECT
}