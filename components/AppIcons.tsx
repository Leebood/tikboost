/**
 * TikBoost App - 统一简洁抽象图标组件
 * 基于 Feather Icons，使用纯白极简风格
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, ViewStyle } from 'react-native';

// 图标颜色常量
export const IconColors = {
  primary: '#111111',      // 主色（近纯黑）
  secondary: '#888888',    // 次级色
  muted: '#CCCCCC',        // 弱化色
  accent: '#FF4444',       // 强调色（极少量使用）
  border: '#ECECEC',       // 边框色
  background: '#F7F7F7',   // 次级背景
};

// 图标尺寸常量
export const IconSizes = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
};

// 图标容器组件 - 统一简洁抽象风格
interface IconContainerProps {
  icon: keyof typeof Feather.glyphMap;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  icon,
  size = 'md',
  color = IconColors.primary,
  backgroundColor,
  style,
}) => {
  const iconSize = IconSizes[size];
  
  return (
    <View
      style={[
        styles.container,
        {
          width: iconSize + 16,
          height: iconSize + 16,
          backgroundColor: backgroundColor || 'transparent',
        },
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={color} />
    </View>
  );
};

// 操作图标组件 - 用于操作按钮
interface ActionIconProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  icon,
  onPress,
  size = 'md',
  color = IconColors.primary,
  disabled = false,
}) => {
  const iconSize = IconSizes[size];
  
  return (
    <View style={[styles.actionContainer, disabled && styles.disabled]}>
      <Feather
        name={icon}
        size={iconSize}
        color={disabled ? IconColors.muted : color}
        onPress={onPress}
      />
    </View>
  );
};

// 导航图标组件
interface NavIconProps {
  icon: keyof typeof Feather.glyphMap;
  focused: boolean;
  size?: 'md' | 'lg';
}

export const NavIcon: React.FC<NavIconProps> = ({
  icon,
  focused,
  size = 'md',
}) => {
  return (
    <Feather
      name={icon}
      size={IconSizes[size]}
      color={focused ? IconColors.primary : IconColors.muted}
    />
  );
};

// 常用图标集合 - 统一导出
export const AppIcons = {
  // 上传相关
  camera: 'camera' as const,
  image: 'image' as const,
  upload: 'upload' as const,
  cloudUpload: 'cloud-upload' as const,
  
  // 导航相关
  home: 'home' as const,
  search: 'search' as const,
  user: 'user' as const,
  settings: 'settings' as const,
  menu: 'menu' as const,
  moreVertical: 'more-vertical' as const,
  
  // 操作相关
  copy: 'copy' as const,
  share: 'share' as const,
  refresh: 'refresh-cw' as const,
  edit: 'edit-2' as const,
  trash: 'trash-2' as const,
  check: 'check' as const,
  close: 'x' as const,
  arrowRight: 'arrow-right' as const,
  arrowLeft: 'arrow-left' as const,
  chevronRight: 'chevron-right' as const,
  chevronDown: 'chevron-down' as const,
  download: 'download' as const,
  
  // 输入相关
  mail: 'mail' as const,
  lock: 'lock' as const,
  eye: 'eye' as const,
  eyeOff: 'eye-off' as const,
  shield: 'shield' as const,
  key: 'key' as const,
  
  // 内容相关
  play: 'play' as const,
  pause: 'pause' as const,
  film: 'film' as const,
  link: 'link' as const,
  tag: 'tag' as const,
  star: 'star' as const,
  heart: 'heart' as const,
  messageCircle: 'message-circle' as const,
  
  // 状态相关
  alertCircle: 'alert-circle' as const,
  info: 'info' as const,
  loader: 'loader' as const,
  checkCircle: 'check-circle' as const,
  xCircle: 'x-circle' as const,
  
  // 社交相关
  send: 'send' as const,
  externalLink: 'external-link' as const,
  globe: 'globe' as const,

  // 深度分析相关
  sparkles: 'star' as const,
  cursor: 'cursor' as const,
  barChart: 'bar-chart' as const,
  trendingUp: 'trending-up' as const,
  layers: 'layers' as const,
  clipboard: 'clipboard' as const,
  target: 'target' as const,
  zap: 'zap' as const,
  smile: 'smile' as const,
  award: 'award' as const,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  actionContainer: {
    padding: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
