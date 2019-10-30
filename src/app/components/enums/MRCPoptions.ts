export const MRCP = [
  {description:'profile to use in mrcp.conf', name:'p', type:'string', value: null},
  {description:'recognition timeout(msec)', name:'t', type:'number', value: 5000},
  {description:'barge-in name', name:'b', type:['0','1'], value: '0'},
  {description:'no input timeout(msec)', name:'nit', type:'number', value: 5000},
  {description:'speech language', name:'spl', type:'string', value: null},
  {description:'recognition mode', name:'rm', type:['normal','hotword'], value: null},
  {description:'prosody volume', name:'pv', type:['silent','x-soft','soft','medium','load','x-loud','default'], value: null},
  {description:'prosody rate', name:'pr', type:['x-slow','slow','medium','fast','x-fast','default'], value: null},
  {description:'voice name', name:'vn', type:'string', value: null},
  {description:'voice gender to use', name:'vg', type:['male','female'], value: null},
  {description:'voice age to use', name:'a', type:'number', value: null},
  {description:'start input timers name', name:'sit', type:['0','1','2'], value: null},

]
