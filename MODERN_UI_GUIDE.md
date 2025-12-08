# 🎨 Modern UI Components - Usage Guide

## Overview
Kjo është dokumentimi për komponentët e rinj UI të implementuar për JobPlatform. Të gjithë komponentët përdorin **glassmorphism**, **gradients**, dhe **smooth animations**.

---

## 📦 Available Components

### 1. GlassCard
Card component me glass effect (glassmorphism).

#### Props:
```typescript
interface GlassCardProps {
    children: React.ReactNode;
    intensity?: 'light' | 'medium' | 'strong';  // Default: 'medium'
    variant?: 'default' | 'gradient' | 'colored';  // Default: 'default'
    borderGlow?: boolean;  // Default: false
    padding?: number;  // Default: 16
}
```

#### Usage Examples:

**Basic Glass Card:**
```tsx
import { GlassCard } from '@/components/ui';

<GlassCard>
  <Text>Content here</Text>
</GlassCard>
```

**With Gradient:**
```tsx
<GlassCard variant="gradient" intensity="strong" borderGlow>
  <Text>Premium content</Text>
</GlassCard>
```

**Colored Glass (Best for highlights):**
```tsx
<GlassCard variant="colored" borderGlow>
  <Text>Featured job</Text>
</GlassCard>
```

---

### 2. GradientButton
Button me gradient background dhe press animation.

#### Props:
```typescript
interface GradientButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'purple';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    animated?: boolean;  // Default: true
}
```

#### Usage Examples:

**Basic:**
```tsx
import { GradientButton } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

<GradientButton
  variant="primary"
  onPress={() => handleApply()}
>
  Apply Now
</GradientButton>
```

**With Icon:**
```tsx
<GradientButton
  variant="success"
  size="lg"
  fullWidth
  icon={<Ionicons name="checkmark-circle" size={24} color="#fff" />}
  onPress={handleSubmit}
>
  Submit Application
</GradientButton>
```

**Loading State:**
```tsx
<GradientButton
  variant="primary"
  loading={isSubmitting}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</GradientButton>
```

**Different Variants:**
```tsx
// Primary (blue gradient)
<GradientButton variant="primary">Primary</GradientButton>

// Success (green gradient)
<GradientButton variant="success">Success</GradientButton>

// Danger (red gradient)
<GradientButton variant="danger">Delete</GradientButton>

// Purple (purple gradient)
<GradientButton variant="purple">Premium</GradientButton>

// Secondary (pink gradient)
<GradientButton variant="secondary">Secondary</GradientButton>
```

---

### 3. GradientBackground
Full screen gradient background.

#### Props:
```typescript
interface GradientBackgroundProps {
    variant?: 'primary' | 'secondary' | 'success' | 'purple' | 'sunset';
    style?: ViewStyle;
    children?: React.ReactNode;
}
```

#### Usage:

**As Screen Background:**
```tsx
import { GradientBackground } from '@/components/ui';

export default function WelcomeScreen() {
  return (
    <GradientBackground variant="primary">
      <View style={styles.content}>
        <Text>Welcome to JobPlatform</Text>
      </View>
    </GradientBackground>
  );
}
```

**Different Gradients:**
- `primary`: Blue → Indigo → Purple
- `secondary`: Purple → Pink → Rose
- `success`: Green → Teal → Cyan
- `purple`: Indigo → Purple → Fuchsia
- `sunset`: Amber → Red → Pink

---

### 4. AnimatedSkeleton
Loading skeleton me shimmer animation.

#### Props:
```typescript
interface AnimatedSkeletonProps {
    width?: number | string;  // Default: '100%'
    height?: number;  // Default: 20
    borderRadius?: number;  // Default: 8
    variant?: 'rect' | 'circle' | 'text';  // Default: 'rect'
}
```

#### Usage:

**Single Skeleton:**
```tsx
import { AnimatedSkeleton } from '@/components/ui';

<AnimatedSkeleton width="80%" height={24} />
<AnimatedSkeleton variant="circle" height={50} />
<AnimatedSkeleton variant="text" width="60%" height={16} />
```

**Pre-built Job Card Skeleton:**
```tsx
import { AnimatedJobCardSkeleton } from '@/components/ui';

<AnimatedJobCardSkeleton />
```

**Custom Skeleton Layout:**
```tsx
<View style={styles.container}>
  <View style={styles.header}>
    <AnimatedSkeleton variant="circle" height={60} />
    <View style={{ flex: 1, gap: 8 }}>
      <AnimatedSkeleton width="70%" height={20} />
      <AnimatedSkeleton width="50%" height={16} />
    </View>
  </View>
  <AnimatedSkeleton width="100%" height={100} />
</View>
```

---

## 🎯 Real-World Examples

### Example 1: Modern Job Card

```tsx
import { GlassCard, GradientButton } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

function JobCard({ job }: { job: Job }) {
  return (
    <GlassCard variant="gradient" borderGlow padding={20}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <BookmarkButton jobId={job.id} />
      </View>

      {/* Meta */}
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text>{job.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="cash" size={16} color="#10B981" />
          <Text>{job.salary}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {job.description}
      </Text>

      {/* Action Button */}
      <GradientButton
        variant="primary"
        fullWidth
        icon={<Ionicons name="rocket" size={20} color="#fff" />}
        onPress={() => handleApply(job.id)}
      >
        Apply Now
      </GradientButton>
    </GlassCard>
  );
}
```

### Example 2: Loading State

```tsx
import { AnimatedJobCardSkeleton } from '@/components/ui';

function JobFeed() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  if (loading) {
    return (
      <View>
        <AnimatedJobCardSkeleton />
        <AnimatedJobCardSkeleton />
        <AnimatedJobCardSkeleton />
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      renderItem={({ item }) => <JobCard job={item} />}
    />
  );
}
```

### Example 3: Login Screen with Gradient

```tsx
import { GradientBackground, GradientButton, GlassCard } from '@/components/ui';

function LoginScreen() {
  return (
    <GradientBackground variant="primary">
      <View style={styles.container}>
        <GlassCard intensity="strong" variant="gradient">
          <Text style={styles.title}>Welcome Back</Text>
          
          <Input
            placeholder="Email"
            keyboardType="email-address"
          />
          
          <Input
            placeholder="Password"
            secureTextEntry
          />
          
          <GradientButton
            variant="primary"
            fullWidth
            size="lg"
            onPress={handleLogin}
            loading={loading}
          >
            Sign In
          </GradientButton>
        </GlassCard>
      </View>
    </GradientBackground>
  );
}
```

### Example 4: Featured Job Highlight

```tsx
<GlassCard variant="colored" borderGlow>
  <View style={styles.featuredBadge}>
    <Ionicons name="star" size={16} color="#F59E0B" />
    <Text style={styles.featuredText}>Featured Job</Text>
  </View>
  
  <Text style={styles.title}>{job.title}</Text>
  <Text style={styles.company}>{job.company}</Text>
  
  <GradientButton
    variant="success"
    fullWidth
    icon={<Ionicons name="flash" size={20} color="#fff" />}
  >
    Quick Apply
  </GradientButton>
</GlassCard>
```

---

## 🎨 Design System Colors

### Gradient Variants:
- **Primary**: `#0EA5E9 → #3B82F6` (Sky Blue → Blue)
- **Secondary**: `#8B5CF6 → #EC4899` (Violet → Pink)
- **Success**: `#10B981 → #14B8A6` (Green → Teal)
- **Danger**: `#EF4444 → #F97316` (Red → Orange)
- **Purple**: `#6366F1 → #8B5CF6` (Indigo → Violet)

### Glass Effect Intensity:
- **Light**: 50-70% opacity
- **Medium**: 65-85% opacity (recommended)
- **Strong**: 85-95% opacity

---

## ✨ Animation Details

All components include:
- ✅ **Scale Animation** on press (GradientButton)
- ✅ **Shimmer Effect** for loading (AnimatedSkeleton)
- ✅ **Smooth Transitions** (react-native-reanimated)
- ✅ **Spring Physics** for natural feel

---

## 📱 Platform Support

- ✅ **iOS**: Full support with native animations
- ✅ **Android**: Full support with elevation
- ✅ **Web**: Partial support (no blur effects on old browsers)

---

## 🚀 Performance Tips

1. **Use AnimatedSkeleton** during data fetching
2. **Limit GlassCard nesting** (max 2 levels)
3. **Disable animations** on low-end devices if needed
4. **Use memoization** for list items with GlassCard

Example:
```tsx
const JobCard = React.memo(({ job }: { job: Job }) => {
  return <GlassCard>{/* content */}</GlassCard>;
});
```

---

## 🔧 Customization

### Custom Gradient Colors:
```tsx
// In GradientButton.tsx, add new variant:
const gradients = {
  // ... existing
  custom: ['#YOUR_COLOR_1', '#YOUR_COLOR_2'] as const,
};
```

### Custom Glass Intensity:
```tsx
// In GlassCard.tsx, modify:
const glassColors = {
  dark: {
    custom: ['rgba(31, 41, 55, 0.9)', 'rgba(31, 41, 55, 0.7)'],
  },
};
```

---

## 📊 Before vs After

| Component | Before | After |
|-----------|--------|-------|
| Card | Flat, static | Glassmorphism, depth |
| Button | Solid color | Gradient, animated |
| Loading | Simple spinner | Skeleton with shimmer |
| Background | Single color | Gradient backgrounds |

---

## 🎓 Best Practices

1. **Use GlassCard** for important content that needs to stand out
2. **Use GradientButton** for primary actions (Apply, Submit, Save)
3. **Use AnimatedSkeleton** for all loading states
4. **Use GradientBackground** sparingly (landing pages, auth screens)
5. **Combine components** for maximum effect (GradientButton inside GlassCard)

---

## 🐛 Troubleshooting

**Issue**: Glass effect not visible
- **Solution**: Ensure parent has a background (image or gradient)

**Issue**: Button animation laggy
- **Solution**: Set `animated={false}` or reduce nested Animated components

**Issue**: Skeleton not animating
- **Solution**: Check if react-native-reanimated is properly installed

---

## 📚 Resources

- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [Glassmorphism Design Trend](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

---

**Last Updated**: 2 Dhjetor 2025  
**Version**: 1.0  
**Author**: JobPlatform Team
