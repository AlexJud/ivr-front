export enum Strings {
    TEXT_FOR_SYNTHESIZE = "Текст для синтеза",
    ASR_OPTION = "Опции распознавания",
    ASR_TYPE = "Способ распознавания",
    KEYWORDS = "Ключевые слова",
    VAR_NAME = "Имя переменной",
    RAW_VAR_NAME = "Имя переменной куда сохранить слитно распознанное слово",
    GRAMMAR = "Грамматика",
    ASR_TOOLTIP = "b = Возможность прервать проигрываемый файл (режим barge-in)\n" +
                   "\t и начать распознавание (нельзя перебить=0, можно перебить" + 
                   "\t и обнаружение речи осуществляет ASR движок=1,можно перебить" + 
                   "\t и обнаружение речи осуществляет Asterisk=2)",
    LOAD_GRAMMAR = 'Загрузить новый файл',
    BUILTIN_GRAMMAR = 'Слитное распознавание',
    FILE_GRAMMAR = 'Распознавание по грамматике',
    REPEAT = 'Количество повторений',
    CHILDREN = 'Дочерние узлы',
    PARAMETRS = 'Параметры',
    CARDNAME = 'Слова для перехода по ветке',
    CARD_SUCCESS = 'Переход в случае успеха',
    CARD_FAIL = 'Переход в случае неудачи'
}
export enum CellType {
    SPAN,
    INPUT,
    TEXTAREA,
    SELECT,
    CARD_WITH_CHIPS,
    CARD_WITHOUT_CHIPS,
    COMBOBOX
}