/**
 * 图标名称处理工具
 * 支持自动转换各种格式的图标名称为Lucide React标准格式
 */

export class IconNameUtil {
  /**
   * 将任意格式的图标名称转换为标准的大驼峰格式
   * @param iconName 图标名称 (支持: kebab-case, snake_case, camelCase, PascalCase)
   * @returns 标准的大驼峰格式图标名称
   */
  static toPascalCase(iconName?: string): string {
    if (!iconName) return 'MoreHorizontal'
    
    const name = iconName.trim()
    
    // 如果已经是大驼峰格式，直接返回
    if (this.isPascalCase(name)) {
      return name
    }
    
    // 转换各种分隔符格式为大驼峰
    return name
      .split(/[-_\s.]+/) // 支持连字符、下划线、空格、点号分割
      .filter(word => word.length > 0) // 过滤空字符串
      .map((word, index) => {
        // 每个单词首字母大写，其余小写
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join('') // 连接成大驼峰
      || 'MoreHorizontal' // 转换失败时的默认值
  }

  /**
   * 检查字符串是否为大驼峰格式
   * @param str 要检查的字符串
   * @returns 是否为大驼峰格式
   */
  static isPascalCase(str: string): boolean {
    // 大驼峰：首字母大写，后续可包含大小写字母和数字，不包含特殊字符
    return /^[A-Z][a-zA-Z0-9]*$/.test(str)
  }

  /**
   * 验证图标名称是否为有效的Lucide图标格式
   * @param iconName 图标名称
   * @returns 是否为有效格式
   */
  static isValidLucideIcon(iconName: string): boolean {
    return this.isPascalCase(iconName) && iconName.length > 0
  }

  /**
   * 常见图标名称的智能转换（处理特殊情况）
   * @param iconName 图标名称
   * @returns 转换后的图标名称
   */
  static normalize(iconName?: string): string {
    if (!iconName) return 'MoreHorizontal'

    // 处理数字后缀的特殊情况
    const specialCases: Record<string, string> = {
      'bar-chart': 'BarChart3',
      'chart-bar': 'BarChart3',
      'gamepad': 'Gamepad2',
      'share': 'Share2',
    }

    const lowerName = iconName.toLowerCase().replace(/[-_\s.]+/g, '-')
    
    // 检查特殊情况
    if (specialCases[lowerName]) {
      return specialCases[lowerName]
    }

    // 使用通用转换
    return this.toPascalCase(iconName)
  }

  /**
   * 批量转换图标名称
   * @param iconNames 图标名称数组
   * @returns 转换后的图标名称数组
   */
  static normalizeAll(iconNames: string[]): string[] {
    return iconNames.map(name => this.normalize(name))
  }
}

export default IconNameUtil