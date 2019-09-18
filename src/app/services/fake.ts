export const FakeSave = [
  {
    'type': 'BranchNode',
    'id': 'root',
    'props': {'synthText': 'Здравствуй, дружочек! Чего желаешь?', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': [{'id': 'Branch_node_0', 'match': ['1']}, {'id': 'System_node_1', 'match': ['1-2']}, {
      'id': 'Specified_node_2',
      'match': ['1-3']
    }, {'id': 'End_node_3', 'match': ['1-5']}]
  },
  {
    'type': 'BranchNode',
    'id': 'Branch_node_0',
    'props': {'synthText': '', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': [{'id': 'Branch_node_4', 'match': ['2']}]
  },
  {
    'type': 'SpecifierNode',
    'id': 'Specified_node_2',
    'edgeList': [{'id': 'System_node_6'}],
    'edgeIfEmpty': [{'id': 'System_node_7'}],
    'props': {'varName': '', 'synthText': '', 'asrOptions': '', 'grammar': 'http://localhost/theme:graph', 'match': ['3-2'], 'repeatMax': ''}
  },
  {
    'type': 'EndNode', 'id': 'End_node_3', 'props': {'synthText': ''}
  },
  {
    'type': 'BranchNode',
    'id': 'Branch_node_4',
    'props': {'synthText': '', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': []
  }];

export const Fakeget = [
  {
    'type': 'BranchNode',
    'id': 'root',
    'props': {'synthText': 'Здравствуй, дружочек! Чего желаешь?', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': [
      {'id': 'Branch_node_0', 'match': ['1']},
      {'id': 'System_node_1', 'match': ['1-2']},
      {'id': 'Specified_node_2', 'match': ['1-3']},
      {'id': 'End_node_3', 'match': ['1-5']}
    ]
  },
  {
    'type': 'BranchNode',
    'id': 'Branch_node_0',
    'props': {'synthText': '', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': [{'id': 'Branch_node_4', 'match': ['2']}]
  },
  {
    'type': 'SpecifierNode',
    'id': 'Specified_node_2',
    'edgeList': [],
    'edgeIfEmpty': [],
    'props': {'varName': '', 'synthText': '', 'asrOptions': '', 'grammar': 'http://localhost/theme:graph', 'match': ['3-2'], 'repeatMax': ''}
  },
  {
    'type': 'EndNode', 'id': 'End_node_3', 'props': {'synthText': ''}
  },
  {
    'type': 'BranchNode',
    'id': 'Branch_node_4',
    'props': {'synthText': '', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
    'edgeList': []
  },
  {
    'id': 'System_node_1',
    'type': 'SystemNode',
    'props': {
      'varName': 'phone',
      'systemVar': 'callerId'
    },
    'edgeList': []
  }
];

export const FakeSave2 =
  [
    {
      'type': 'BranchNode',
      'id': 'root',
      'props': {'synthText': 'Здравствуй, дружочек! Чего желаешь?', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [
        {'id': 'Node_0', 'match': ['привет', ' может быть']},
        {'id': 'Node_1', 'match': ['занят']},
        {'id': 'Node_2', 'match': ['телефон']},
        {'id': 'Node_3', 'match': ['ушел']}
      ]
    },
    {
      'type': 'BranchNode',
      'id': 'Node_0',
      'props': {'synthText': 'Синтез речи', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [
        {'id': 'Node_4', 'match': ['невозможно']}
      ]
    },
    {
      'type': 'SpecifierNode',
      'id': 'Node_1',
      'edgeList': [{'id': 'Node_5'}],
      'edgeIfEmpty': [],
      'props': {
        'varName': '',
        'synthText': 'Как дела?',
        'asrOptions': '',
        'grammar': 'http://localhost/theme:graph',
        'match': ['да'],
        'repeatMax': ''
      }
    },
    {'type': 'EndNode', 'id': 'Node_3', 'props': {'synthText': 'Не говори мне больше ничего'}}, {
    'type': 'SpecifierNode',
    'id': 'Node_4',
    'edgeList': [],
    'edgeIfEmpty': [],
    'props': {
      'varName': '',
      'synthText': 'выбери цвет синий',
      'asrOptions': '',
      'grammar': 'http://localhost/theme:graph',
      'match': [],
      'repeatMax': ''
    }
  },
    {
      'type': 'BranchNode',
      'id': 'Node_5',
      'props': {'synthText': 'еще вопросы', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [{'id': 'Node_6', 'match': ['ничего']}]
    },
    {
      'type': 'EndNode', 'id': 'Node_6', 'props': {'synthText': 'Пока'}
    }
  ];

export const FakeGet2 =
  [
    {
      'type': 'BranchNode',
      'id': 'root',
      'props': {'synthText': 'Здравствуй, дружочек! Чего желаешь?', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [
        {'id': 'Node_0', 'match': ['привет', ' может быть']},
        {'id': 'Node_1', 'match': ['занят']},
        {'id': 'Node_3', 'match': ['ушел']}]
    },
    {
      'type': 'BranchNode',
      'id': 'Node_0',
      'props': {'synthText': 'Синтез речи', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [
        {'id': 'Node_4', 'match': ['невозможно']}
      ]
    },
    {
      'type': 'SpecifierNode',
      'id': 'Node_1',
      'edgeList': [{'id': 'Node_5'}],
      'edgeIfEmpty': [],
      'props': {
        'varName': '',
        'synthText': 'Как дела?',
        'asrOptions': '',
        'grammar': 'http://localhost/theme:graph',
        'match': ['да'],
        'repeatMax': ''
      }
    },
    {'type': 'EndNode', 'id': 'Node_3', 'props': {'synthText': 'Не говори мне больше ничего'}}, {
    'type': 'SpecifierNode',
    'id': 'Node_4',
    'edgeList': [],
    'edgeIfEmpty': [],
    'props': {
      'varName': '',
      'synthText': 'выбери цвет синий',
      'asrOptions': '',
      'grammar': 'http://localhost/theme:graph',
      'match': [],
      'repeatMax': ''
    }
  },
    {
      'type': 'BranchNode',
      'id': 'Node_5',
      'props': {'synthText': 'еще вопросы', 'grammar': 'http://localhost/theme:graph', 'asrOptions': ''},
      'edgeList': [{'id': 'Node_6', 'match': ['ничего']}]
    },
    {'type': 'EndNode', 'id': 'Node_6', 'props': {'synthText': 'Пока'}}];

export const Fake3 =
  [{
    'id': 'Node0',
    'type': 'BranchNode',
    'props': {'synthText': 'Как дела?'},
    'edgeList': [
      {'id': 'Node1', 'match': []},
      {'id': 'Node2', 'match': []},
      {'id': 'Node3', 'match': []}]
  }, {
    'id': 'Node1',
    'type': 'SpecifierNode',
    'props': {'match': []}, 'edgeList': [], 'edgeIfEmpty': []
  }, {
    'id': 'Node2',
    'type': 'BranchNode',
    'props': {},
    'edgeList': [{'id': 'Node4', 'match': []}]
  }, {
    'id': 'Node3', 'type': 'SystemNode', 'props': {}, 'edgeList': []
  },
    {
      'id': 'Node4',
      'type': 'SpecifierNode',
      'props': {'match': []},
      'edgeList': [{'id': 'Node5', 'match': []}],
      'edgeIfEmpty': [{'id': 'Node6', 'match': []}]
    }, {
    'id': 'Node5', 'type': 'BranchNode', 'props': {}, 'edgeList': []
  },
    {
      'id': 'Node6', 'type': 'SystemNode', 'props': {}, 'edgeList': []
    }
  ];

export const x =
  [{
    'id': 'Node0',
    'type': 'BranchNode',
    'props': {'synthText': 'Как дела?'},
    'edgeList': [{'id': 'Node1', 'match': ['тест']}, {'id': 'Node2', 'match': ['нет']}]
  }, {'id': 'Node1', 'type': 'SpecifierNode', 'props': {'synthText': 'Чего надо?', 'match': []}, 'edgeList': [], 'edgeIfEmpty': []}, {
    'id': 'Node2',
    'type': 'BranchNode',
    'props': {'synthText': 'Привет'},
    'edgeList': [{'id': 'Node3', 'match': []}]
  }, {'id': 'Node3', 'type': 'SpecifierNode', 'props': {'synthText': 'Ветер', 'match': []}, 'edgeList': [], 'edgeIfEmpty': []}];
