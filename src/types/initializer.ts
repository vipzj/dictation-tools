// Types for the quick initialization feature

export interface SampleTag {
  name: string
  color: string
}

export interface SampleUnit {
  name: string
  tagIds?: string[]
}

export interface SampleVocabulary {
  unitId: string
  type: 'chinese' | 'english'
  text: string
}

export interface InitializationStats {
  tagsCount: number
  unitsCount: number
  vocabularyCount: number
}

// Sample data constants
export const SAMPLE_TAGS: SampleTag[] = [
  { name: 'Beginner', color: '#4CAF50' },
  { name: 'Intermediate', color: '#FF9800' },
  { name: 'Advanced', color: '#F44336' },
  { name: 'Business', color: '#2196F3' },
  { name: 'Daily Life', color: '#9C27B0' }
]

export const SAMPLE_UNITS: SampleUnit[] = [
  { name: 'Basic Greetings', tagIds: [] },
  { name: 'Numbers and Time', tagIds: [] },
  { name: 'Food and Drinks', tagIds: [] },
  { name: 'Family and Friends', tagIds: [] },
  { name: 'Work and Office', tagIds: [] },
  {name: 'Travel and Places', tagIds: [] }
]

// Sample vocabulary data organized by unit
export const SAMPLE_VOCABULARY: Record<string, SampleVocabulary[]> = {
  'Basic Greetings': [
    { unitId: '', type: 'chinese', text: '你好' },
    { unitId: '', type: 'english', text: 'Hello' },
    { unitId: '', type: 'chinese', text: '谢谢' },
    { unitId: '', type: 'english', text: 'Thank you' },
    { unitId: '', type: 'chinese', text: '再见' },
    { unitId: '', type: 'english', text: 'Goodbye' },
    { unitId: '', type: 'chinese', text: '对不起' },
    { unitId: '', type: 'english', text: 'Sorry' },
    { unitId: '', type: 'chinese', text: '欢迎' },
    { unitId: '', type: 'english', text: 'Welcome' }
  ],
  'Numbers and Time': [
    { unitId: '', type: 'chinese', text: '一' },
    { unitId: '', type: 'english', text: 'One' },
    { unitId: '', type: 'chinese', text: '二' },
    { unitId: '', type: 'english', text: 'Two' },
    { unitId: '', type: 'chinese', text: '三' },
    { unitId: '', type: 'english', text: 'Three' },
    { unitId: '', type: 'chinese', text: '今天' },
    { unitId: '', type: 'english', text: 'Today' },
    { unitId: '', type: 'chinese', text: '明天' },
    { unitId: '', type: 'english', text: 'Tomorrow' },
    { unitId: '', type: 'chinese', text: '现在' },
    { unitId: '', type: 'english', text: 'Now' }
  ],
  'Food and Drinks': [
    { unitId: '', type: 'chinese', text: '水' },
    { unitId: '', type: 'english', text: 'Water' },
    { unitId: '', type: 'chinese', text: '米饭' },
    { unitId: '', type: 'english', text: 'Rice' },
    { unitId: '', type: 'chinese', text: '茶' },
    { unitId: '', type: 'english', text: 'Tea' },
    { unitId: '', type: 'chinese', text: '咖啡' },
    { unitId: '', type: 'english', text: 'Coffee' },
    { unitId: '', type: 'chinese', text: '面包' },
    { unitId: '', type: 'english', text: 'Bread' },
    { unitId: '', type: 'chinese', text: '牛奶' },
    { unitId: '', type: 'english', text: 'Milk' }
  ],
  'Family and Friends': [
    { unitId: '', type: 'chinese', text: '家人' },
    { unitId: '', type: 'english', text: 'Family' },
    { unitId: '', type: 'chinese', text: '朋友' },
    { unitId: '', type: 'english', text: 'Friend' },
    { unitId: '', type: 'chinese', text: '老师' },
    { unitId: '', type: 'english', text: 'Teacher' },
    { unitId: '', type: 'chinese', text: '学生' },
    { unitId: '', type: 'english', text: 'Student' },
    { unitId: '', type: 'chinese', text: '父母' },
    { unitId: '', type: 'english', text: 'Parents' },
    { unitId: '', type: 'chinese', text: '孩子' },
    { unitId: '', type: 'english', text: 'Child' },
    { unitId: '', type: 'chinese', text: '兄弟' },
    { unitId: '', type: 'english', text: 'Brother' },
    { unitId: '', type: 'chinese', text: '姐妹' },
    { unitId: '', type: 'english', text: 'Sister' }
  ],
  'Work and Office': [
    { unitId: '', type: 'chinese', text: '工作' },
    { unitId: '', type: 'english', text: 'Work' },
    { unitId: '', type: 'chinese', text: '会议' },
    { unitId: '', type: 'english', text: 'Meeting' },
    { unitId: '', type: 'chinese', text: '项目' },
    { unitId: '', type: 'english', text: 'Project' },
    { unitId: '', type: 'chinese', text: '报告' },
    { unitId: '', type: 'english', text: 'Report' },
    { unitId: '', type: 'chinese', text: '办公室' },
    { unitId: '', type: 'english', text: 'Office' },
    { unitId: '', type: 'chinese', text: '同事' },
    { unitId: '', type: 'english', text: 'Colleague' },
    { unitId: '', type: 'chinese', text: '经理' },
    { unitId: '', type: 'english', text: 'Manager' },
    { unitId: '', type: 'chinese', text: '老板' },
    { unitId: '', type: 'english', text: 'Boss' }
  ],
  'Travel and Places': [
    { unitId: '', type: 'chinese', text: '去' },
    { unitId: '', type: 'english', text: 'Go' },
    { unitId: '', type: 'chinese', text: '来' },
    { unitId: '', type: 'english', text: 'Come' },
    { unitId: '', type: 'chinese', text: '学校' },
    { unitId: '', type: 'english', text: 'School' },
    { unitId: '', type: 'chinese', text: '医院' },
    { unitId: '', type: 'english', text: 'Hospital' },
    { unitId: '', type: 'chinese', text: '商店' },
    { unitId: '', type: 'english', text: 'Store' },
    { unitId: '', type: 'chinese', text: '公园' },
    { unitId: '', type: 'english', text: 'Park' },
    { unitId: '', type: 'chinese', text: '机场' },
    { unitId: '', type: 'english', text: 'Airport' },
    { unitId: '', type: 'chinese', text: '酒店' },
    { unitId: '', type: 'english', text: 'Hotel' },
    { unitId: '', type: 'chinese', text: '家' },
    { unitId: '', type: 'english', text: 'Home' }
  ]
}