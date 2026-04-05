import Mock from 'mockjs'
import { success } from '../utils'

// 模拟当前学生ID
let currentStudentId = 1

export function setCurrentStudentId(id) {
  currentStudentId = id
}

export function getCurrentStudentId() {
  return currentStudentId
}

// 课程列表
const courseList = {
  1: [
    { value: 'math', label: '高等数学' },
    { value: 'linear-algebra', label: '线性代数' },
    { value: 'probability', label: '概率论与数理统计' },
    { value: 'discrete-math', label: '离散数学' },
  ],
  3: [
    { value: 'math', label: '高等数学' },
    { value: 'linear-algebra', label: '线性代数' },
    { value: 'probability', label: '概率论与数理统计' },
  ],
}

// 知识点树形数据
const knowledgeTreeData = {
  1: {
    math: [
      {
        id: '1',
        label: '📐 高等数学',
        masteryRate: 72,
        children: [
          {
            id: '1-1',
            label: '函数与极限',
            masteryRate: 58,
            masteryLevel: 'warning',
            weakPoints: ['极限定义', '无穷小比较'],
          },
          { id: '1-2', label: '导数与微分', masteryRate: 85, masteryLevel: 'good', weakPoints: [] },
          {
            id: '1-3',
            label: '积分学',
            masteryRate: 45,
            masteryLevel: 'poor',
            weakPoints: ['不定积分', '定积分应用'],
          },
          {
            id: '1-4',
            label: '微分方程',
            masteryRate: 68,
            masteryLevel: 'warning',
            weakPoints: ['一阶方程', '二阶方程'],
          },
          {
            id: '1-5',
            label: '级数',
            masteryRate: 52,
            masteryLevel: 'poor',
            weakPoints: ['收敛判别', '幂级数'],
          },
        ],
      },
      {
        id: '2',
        label: '📊 线性代数',
        masteryRate: 88,
        children: [
          { id: '2-1', label: '行列式', masteryRate: 92, masteryLevel: 'good', weakPoints: [] },
          {
            id: '2-2',
            label: '矩阵',
            masteryRate: 85,
            masteryLevel: 'good',
            weakPoints: ['矩阵运算'],
          },
          {
            id: '2-3',
            label: '向量组',
            masteryRate: 78,
            masteryLevel: 'warning',
            weakPoints: ['线性相关', '秩'],
          },
          { id: '2-4', label: '线性方程组', masteryRate: 90, masteryLevel: 'good', weakPoints: [] },
          {
            id: '2-5',
            label: '特征值与特征向量',
            masteryRate: 82,
            masteryLevel: 'good',
            weakPoints: [],
          },
        ],
      },
      {
        id: '3',
        label: '🎲 概率论与数理统计',
        masteryRate: 65,
        children: [
          {
            id: '3-1',
            label: '随机事件与概率',
            masteryRate: 75,
            masteryLevel: 'warning',
            weakPoints: ['条件概率'],
          },
          {
            id: '3-2',
            label: '随机变量',
            masteryRate: 70,
            masteryLevel: 'warning',
            weakPoints: ['分布函数'],
          },
          { id: '3-3', label: '数字特征', masteryRate: 82, masteryLevel: 'good', weakPoints: [] },
          {
            id: '3-4',
            label: '大数定律',
            masteryRate: 45,
            masteryLevel: 'poor',
            weakPoints: ['切比雪夫', '中心极限'],
          },
          {
            id: '3-5',
            label: '参数估计',
            masteryRate: 55,
            masteryLevel: 'poor',
            weakPoints: ['点估计', '区间估计'],
          },
        ],
      },
    ],
    'linear-algebra': [
      {
        id: '2',
        label: '📊 线性代数',
        masteryRate: 88,
        children: [
          { id: '2-1', label: '行列式', masteryRate: 92, masteryLevel: 'good', weakPoints: [] },
          {
            id: '2-2',
            label: '矩阵',
            masteryRate: 85,
            masteryLevel: 'good',
            weakPoints: ['矩阵运算'],
          },
          {
            id: '2-3',
            label: '向量组',
            masteryRate: 78,
            masteryLevel: 'warning',
            weakPoints: ['线性相关', '秩'],
          },
          { id: '2-4', label: '线性方程组', masteryRate: 90, masteryLevel: 'good', weakPoints: [] },
          {
            id: '2-5',
            label: '特征值与特征向量',
            masteryRate: 82,
            masteryLevel: 'good',
            weakPoints: [],
          },
        ],
      },
    ],
    probability: [
      {
        id: '3',
        label: '🎲 概率论与数理统计',
        masteryRate: 65,
        children: [
          {
            id: '3-1',
            label: '随机事件与概率',
            masteryRate: 75,
            masteryLevel: 'warning',
            weakPoints: ['条件概率'],
          },
          {
            id: '3-2',
            label: '随机变量',
            masteryRate: 70,
            masteryLevel: 'warning',
            weakPoints: ['分布函数'],
          },
          { id: '3-3', label: '数字特征', masteryRate: 82, masteryLevel: 'good', weakPoints: [] },
          {
            id: '3-4',
            label: '大数定律',
            masteryRate: 45,
            masteryLevel: 'poor',
            weakPoints: ['切比雪夫', '中心极限'],
          },
          {
            id: '3-5',
            label: '参数估计',
            masteryRate: 55,
            masteryLevel: 'poor',
            weakPoints: ['点估计', '区间估计'],
          },
        ],
      },
    ],
    'discrete-math': [
      {
        id: '4',
        label: '🔢 离散数学',
        masteryRate: 70,
        children: [
          { id: '4-1', label: '集合论', masteryRate: 85, masteryLevel: 'good', weakPoints: [] },
          {
            id: '4-2',
            label: '数理逻辑',
            masteryRate: 72,
            masteryLevel: 'warning',
            weakPoints: ['命题逻辑'],
          },
          {
            id: '4-3',
            label: '图论',
            masteryRate: 58,
            masteryLevel: 'poor',
            weakPoints: ['最短路径', '最小生成树'],
          },
          {
            id: '4-4',
            label: '代数系统',
            masteryRate: 68,
            masteryLevel: 'warning',
            weakPoints: ['群论'],
          },
        ],
      },
    ],
  },
  3: {
    math: [
      {
        id: '1',
        label: '📐 高等数学',
        masteryRate: 68,
        children: [
          {
            id: '1-1',
            label: '函数与极限',
            masteryRate: 55,
            masteryLevel: 'warning',
            weakPoints: ['极限定义'],
          },
          { id: '1-2', label: '导数与微分', masteryRate: 80, masteryLevel: 'good', weakPoints: [] },
          {
            id: '1-3',
            label: '积分学',
            masteryRate: 42,
            masteryLevel: 'poor',
            weakPoints: ['不定积分'],
          },
          {
            id: '1-4',
            label: '微分方程',
            masteryRate: 65,
            masteryLevel: 'warning',
            weakPoints: ['一阶方程'],
          },
        ],
      },
    ],
    'linear-algebra': [
      {
        id: '2',
        label: '📊 线性代数',
        masteryRate: 82,
        children: [
          { id: '2-1', label: '行列式', masteryRate: 88, masteryLevel: 'good', weakPoints: [] },
          { id: '2-2', label: '矩阵', masteryRate: 80, masteryLevel: 'good', weakPoints: [] },
          {
            id: '2-3',
            label: '向量组',
            masteryRate: 75,
            masteryLevel: 'warning',
            weakPoints: ['线性相关'],
          },
          { id: '2-4', label: '线性方程组', masteryRate: 85, masteryLevel: 'good', weakPoints: [] },
        ],
      },
    ],
  },
}

// 知识点掌握环图数据（按知识点分类）
const donutData = {
  1: {
    math: [
      { value: 85, name: '函数与极限', itemStyle: { color: '#2d6a9f' } },
      { value: 62, name: '导数与微分', itemStyle: { color: '#f09b48' } },
      { value: 78, name: '积分学', itemStyle: { color: '#3a9b9b' } },
      { value: 45, name: '微分方程', itemStyle: { color: '#8561b3' } },
      { value: 68, name: '级数', itemStyle: { color: '#e74c3c' } },
    ],
    'linear-algebra': [
      { value: 92, name: '行列式', itemStyle: { color: '#2d6a9f' } },
      { value: 85, name: '矩阵', itemStyle: { color: '#f09b48' } },
      { value: 78, name: '向量组', itemStyle: { color: '#3a9b9b' } },
      { value: 90, name: '线性方程组', itemStyle: { color: '#8561b3' } },
      { value: 82, name: '特征值与特征向量', itemStyle: { color: '#e74c3c' } },
    ],
    probability: [
      { value: 75, name: '随机事件与概率', itemStyle: { color: '#2d6a9f' } },
      { value: 70, name: '随机变量', itemStyle: { color: '#f09b48' } },
      { value: 82, name: '数字特征', itemStyle: { color: '#3a9b9b' } },
      { value: 45, name: '大数定律', itemStyle: { color: '#8561b3' } },
      { value: 55, name: '参数估计', itemStyle: { color: '#e74c3c' } },
    ],
    'discrete-math': [
      { value: 85, name: '集合论', itemStyle: { color: '#2d6a9f' } },
      { value: 72, name: '数理逻辑', itemStyle: { color: '#f09b48' } },
      { value: 58, name: '图论', itemStyle: { color: '#3a9b9b' } },
      { value: 68, name: '代数系统', itemStyle: { color: '#8561b3' } },
    ],
  },
  3: {
    math: [
      { value: 55, name: '函数与极限', itemStyle: { color: '#2d6a9f' } },
      { value: 80, name: '导数与微分', itemStyle: { color: '#f09b48' } },
      { value: 42, name: '积分学', itemStyle: { color: '#3a9b9b' } },
      { value: 65, name: '微分方程', itemStyle: { color: '#8561b3' } },
    ],
    'linear-algebra': [
      { value: 88, name: '行列式', itemStyle: { color: '#2d6a9f' } },
      { value: 80, name: '矩阵', itemStyle: { color: '#f09b48' } },
      { value: 75, name: '向量组', itemStyle: { color: '#3a9b9b' } },
      { value: 85, name: '线性方程组', itemStyle: { color: '#8561b3' } },
    ],
  },
}

// 雷达图数据（细粒度知识点）
const radarData = {
  1: {
    math: {
      indicators: ['极限', '连续性', '导数', '微分', '不定积分', '定积分'],
      values: [78, 65, 92, 88, 45, 63],
    },
    'linear-algebra': {
      indicators: ['行列式', '矩阵运算', '向量组', '线性相关', '方程组', '特征值'],
      values: [92, 85, 78, 70, 90, 82],
    },
    probability: {
      indicators: ['概率计算', '条件概率', '分布函数', '期望方差', '大数定律', '参数估计'],
      values: [75, 60, 70, 82, 45, 55],
    },
    'discrete-math': {
      indicators: ['集合运算', '命题逻辑', '图遍历', '最短路径', '群论', '格论'],
      values: [85, 72, 58, 55, 68, 50],
    },
  },
  3: {
    math: {
      indicators: ['极限', '连续性', '导数', '微分', '不定积分', '定积分'],
      values: [55, 60, 80, 75, 42, 50],
    },
    'linear-algebra': {
      indicators: ['行列式', '矩阵运算', '向量组', '线性相关', '方程组', '特征值'],
      values: [88, 80, 75, 65, 85, 78],
    },
  },
}

// 个性化学习资源推荐
const recommendationsData = {
  1: {
    math: [
      {
        id: 1,
        title: '函数与极限 - 从零到精通',
        type: '视频课程',
        match: 95,
        url: '',
        difficulty: '中等',
      },
      {
        id: 2,
        title: '积分计算技巧大全',
        type: '图文教程',
        match: 92,
        url: '',
        difficulty: '困难',
      },
      {
        id: 3,
        title: '微分方程专项训练',
        type: '练习题集',
        match: 88,
        url: '',
        difficulty: '中等',
      },
      { id: 4, title: '级数收敛判别法', type: '思维导图', match: 85, url: '', difficulty: '中等' },
    ],
    'linear-algebra': [
      {
        id: 1,
        title: '向量组线性相关性解析',
        type: '视频课程',
        match: 90,
        url: '',
        difficulty: '中等',
      },
      {
        id: 2,
        title: '矩阵运算速成指南',
        type: '图文教程',
        match: 88,
        url: '',
        difficulty: '简单',
      },
      { id: 3, title: '特征值应用案例', type: '案例分析', match: 85, url: '', difficulty: '困难' },
    ],
    probability: [
      {
        id: 1,
        title: '大数定律与中心极限定理',
        type: '视频课程',
        match: 95,
        url: '',
        difficulty: '困难',
      },
      {
        id: 2,
        title: '参数估计方法详解',
        type: '图文教程',
        match: 92,
        url: '',
        difficulty: '中等',
      },
      { id: 3, title: '概率论思维训练', type: '练习题集', match: 88, url: '', difficulty: '中等' },
    ],
    default: [
      {
        id: 1,
        title: '高等数学基础巩固',
        type: '视频课程',
        match: 85,
        url: '',
        difficulty: '中等',
      },
      { id: 2, title: '数学思维训练营', type: '直播课', match: 80, url: '', difficulty: '中等' },
      { id: 3, title: '考研数学真题解析', type: '真题库', match: 75, url: '', difficulty: '困难' },
    ],
  },
  3: {
    math: [
      {
        id: 1,
        title: '函数与极限基础入门',
        type: '视频课程',
        match: 92,
        url: '',
        difficulty: '简单',
      },
      {
        id: 2,
        title: '积分计算从零开始',
        type: '图文教程',
        match: 90,
        url: '',
        difficulty: '中等',
      },
    ],
    default: [
      { id: 1, title: '数学基础提升', type: '视频课程', match: 80, url: '', difficulty: '中等' },
    ],
  },
}

export default function mockKnowledgeMastery() {
  // 获取课程列表
  Mock.mock(/\/api\/knowledge\/courses/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const data = courseList[id] || courseList[1]
    return success(data)
  })

  // 获取知识点树形数据
  Mock.mock(/\/api\/knowledge\/tree/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!courseId) {
      return error('请选择课程', 400)
    }

    const courseData = knowledgeTreeData[id] || knowledgeTreeData[1]
    const data = courseData[courseId] || courseData.math || []
    return success(data)
  })

  // 获取知识点掌握环图数据
  Mock.mock(/\/api\/knowledge\/donut/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!courseId) {
      return error('请选择课程', 400)
    }

    const donutCourseData = donutData[id] || donutData[1]
    const data = donutCourseData[courseId] || donutCourseData.math || []
    return success(data)
  })

  // 获取雷达图数据
  Mock.mock(/\/api\/knowledge\/radar/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    if (!courseId) {
      return error('请选择课程', 400)
    }

    const radarCourseData = radarData[id] || radarData[1]
    const data = radarCourseData[courseId] ||
      radarCourseData.math || {
        indicators: ['知识点1', '知识点2', '知识点3', '知识点4', '知识点5', '知识点6'],
        values: [0, 0, 0, 0, 0, 0],
      }
    return success(data)
  })

  // 获取个性化学习资源推荐
  Mock.mock(/\/api\/knowledge\/recommendations/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    const recCourseData = recommendationsData[id] || recommendationsData[1]
    const data = recCourseData[courseId] || recCourseData.default || []
    return success(data)
  })

  Mock.mock(/\/api\/knowledge\/detail/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const studentId = url.searchParams.get('studentId')
    const knowledgeId = url.searchParams.get('knowledgeId')
    const courseId = url.searchParams.get('courseId')
    const id = studentId ? parseInt(studentId) : currentStudentId

    // 根据知识点ID返回不同的详情数据
    const knowledgeDetails = {
      '1-1': {
        // 函数与极限
        id: '1-1',
        name: '函数与极限',
        masteryRate: 58,
        masteryLevel: 'warning',
        weakPoints: ['极限定义理解不深', '无穷小比较容易混淆', '极限运算法则掌握不牢'],
        suggestions: [
          '建议从函数极限的ε-δ定义开始重新理解',
          '完成20道极限计算基础题',
          '观看极限概念的动画演示视频',
        ],
        resources: [
          {
            id: 101,
            title: '函数极限精讲',
            type: '视频',
            icon: 'fa-video',
            duration: '45分钟',
            url: '',
            difficulty: '中等',
          },
          {
            id: 102,
            title: '极限计算技巧大全',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '30分钟',
            url: '',
            difficulty: '简单',
          },
          {
            id: 103,
            title: '极限经典例题解析',
            type: '直播',
            icon: 'fa-chalkboard-teacher',
            duration: '60分钟',
            url: '',
            difficulty: '困难',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 35 },
          { week: '第2周', score: 42 },
          { week: '第3周', score: 48 },
          { week: '第4周', score: 52 },
          { week: '第5周', score: 55 },
          { week: '第6周', score: 58 },
        ],
      },
      '1-2': {
        // 导数与微分
        id: '1-2',
        name: '导数与微分',
        masteryRate: 85,
        masteryLevel: 'good',
        weakPoints: ['高阶导数计算', '隐函数求导'],
        suggestions: [
          '导数几何意义已掌握较好',
          '建议挑战更复杂的复合函数求导',
          '尝试解决实际应用问题',
        ],
        resources: [
          {
            id: 104,
            title: '导数几何意义详解',
            type: '视频',
            icon: 'fa-video',
            duration: '40分钟',
            url: '',
            difficulty: '简单',
          },
          {
            id: 105,
            title: '求导法则速记',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '25分钟',
            url: '',
            difficulty: '简单',
          },
          {
            id: 106,
            title: '导数在优化问题中的应用',
            type: '视频',
            icon: 'fa-video',
            duration: '50分钟',
            url: '',
            difficulty: '中等',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 65 },
          { week: '第2周', score: 72 },
          { week: '第3周', score: 78 },
          { week: '第4周', score: 82 },
          { week: '第5周', score: 84 },
          { week: '第6周', score: 85 },
        ],
      },
      '1-3': {
        // 积分学
        id: '1-3',
        name: '积分学',
        masteryRate: 45,
        masteryLevel: 'poor',
        weakPoints: ['不定积分换元法', '分部积分法', '定积分应用'],
        suggestions: [
          '建议从积分表开始记忆常用积分公式',
          '重点练习换元积分法和分部积分法',
          '完成20道积分计算基础题',
          '观看积分概念的动画演示',
        ],
        resources: [
          {
            id: 107,
            title: '不定积分技巧',
            type: '视频',
            icon: 'fa-video',
            duration: '50分钟',
            url: '',
            difficulty: '中等',
          },
          {
            id: 108,
            title: '定积分应用案例',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '35分钟',
            url: '',
            difficulty: '中等',
          },
          {
            id: 109,
            title: '积分计算强化训练',
            type: '练习题集',
            icon: 'fa-pencil-alt',
            duration: '60分钟',
            url: '',
            difficulty: '困难',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 25 },
          { week: '第2周', score: 30 },
          { week: '第3周', score: 35 },
          { week: '第4周', score: 38 },
          { week: '第5周', score: 42 },
          { week: '第6周', score: 45 },
        ],
      },
      '1-4': {
        // 微分方程
        id: '1-4',
        name: '微分方程',
        masteryRate: 68,
        masteryLevel: 'warning',
        weakPoints: ['一阶线性微分方程', '二阶常系数微分方程'],
        suggestions: [
          '重点掌握一阶微分方程的求解方法',
          '理解二阶微分方程的特征方程法',
          '多做应用题理解物理意义',
        ],
        resources: [
          {
            id: 110,
            title: '微分方程入门',
            type: '视频',
            icon: 'fa-video',
            duration: '45分钟',
            url: '',
            difficulty: '简单',
          },
          {
            id: 111,
            title: '微分方程解法大全',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '40分钟',
            url: '',
            difficulty: '中等',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 50 },
          { week: '第2周', score: 55 },
          { week: '第3周', score: 60 },
          { week: '第4周', score: 64 },
          { week: '第5周', score: 66 },
          { week: '第6周', score: 68 },
        ],
      },
      '2-1': {
        // 行列式
        id: '2-1',
        name: '行列式',
        masteryRate: 92,
        masteryLevel: 'good',
        weakPoints: [],
        suggestions: [
          '行列式掌握优秀，可以挑战更高难度题目',
          '建议学习行列式在机器学习中的应用',
          '可以辅导其他同学',
        ],
        resources: [
          {
            id: 112,
            title: '行列式进阶技巧',
            type: '视频',
            icon: 'fa-video',
            duration: '35分钟',
            url: '',
            difficulty: '中等',
          },
          {
            id: 113,
            title: '行列式在机器学习中的应用',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '45分钟',
            url: '',
            difficulty: '困难',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 75 },
          { week: '第2周', score: 82 },
          { week: '第3周', score: 86 },
          { week: '第4周', score: 89 },
          { week: '第5周', score: 91 },
          { week: '第6周', score: 92 },
        ],
      },
      '3-4': {
        // 大数定律
        id: '3-4',
        name: '大数定律',
        masteryRate: 45,
        masteryLevel: 'poor',
        weakPoints: ['切比雪夫不等式', '大数定律的理解', '中心极限定理应用'],
        suggestions: [
          '从切比雪夫不等式开始理解',
          '观看大数定律的模拟演示',
          '理解大数定律的实际意义',
          '多做中心极限定理的例题',
        ],
        resources: [
          {
            id: 114,
            title: '大数定律详解',
            type: '视频',
            icon: 'fa-video',
            duration: '50分钟',
            url: '',
            difficulty: '中等',
          },
          {
            id: 115,
            title: '中心极限定理应用',
            type: '图文',
            icon: 'fa-file-alt',
            duration: '40分钟',
            url: '',
            difficulty: '困难',
          },
          {
            id: 116,
            title: '概率论思维训练',
            type: '练习题集',
            icon: 'fa-pencil-alt',
            duration: '45分钟',
            url: '',
            difficulty: '中等',
          },
        ],
        learningTrend: [
          { week: '第1周', score: 25 },
          { week: '第2周', score: 30 },
          { week: '第3周', score: 35 },
          { week: '第4周', score: 38 },
          { week: '第5周', score: 42 },
          { week: '第6周', score: 45 },
        ],
      },
    }

    // 默认数据
    const defaultDetail = {
      id: knowledgeId,
      name: '知识点',
      masteryRate: 60,
      masteryLevel: 'warning',
      weakPoints: ['基础概念理解不深', '解题技巧需要加强'],
      suggestions: ['建议重新学习基础概念', '完成配套练习题', '观看教学视频加深理解'],
      resources: [
        {
          id: 999,
          title: '基础教程',
          type: '视频',
          icon: 'fa-video',
          duration: '45分钟',
          url: '',
          difficulty: '简单',
        },
        {
          id: 998,
          title: '习题精讲',
          type: '图文',
          icon: 'fa-file-alt',
          duration: '30分钟',
          url: '',
          difficulty: '中等',
        },
      ],
      learningTrend: [
        { week: '第1周', score: 40 },
        { week: '第2周', score: 45 },
        { week: '第3周', score: 50 },
        { week: '第4周', score: 54 },
        { week: '第5周', score: 57 },
        { week: '第6周', score: 60 },
      ],
    }

    const data = knowledgeDetails[knowledgeId] || defaultDetail
    return success(data)
  })
}
