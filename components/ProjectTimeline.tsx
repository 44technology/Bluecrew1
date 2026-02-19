import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { ProjectStep } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectTimelineProps {
  steps: ProjectStep[];
  showLabels?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  steps, 
  showLabels = true 
}) => {
  const { t } = useLanguage();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const getStepColor = (status: ProjectStep['status']) => {
    switch (status) {
      case 'pending':
        return '#000000'; // Grey for pending
      case 'in_progress':
        return '#f97316'; // Orange for in progress
      case 'finished':
        return '#22c55e'; // Green for finished
      default:
        return '#000000'; // Default grey
    }
  };

  // Sadece parent (work title) adımlarını kullan; kareler ve yüzde çizgisi bunlara göre güncellenir
  const parentSteps = steps.filter(
    (s) => s.step_type === 'parent' || !s.parent_step_id
  );
  const sortedSteps = [...parentSteps].sort((a, b) => a.order_index - b.order_index);
  const totalSteps = sortedSteps.length;

  const stepPercentage = totalSteps > 0 ? 100 / totalSteps : 0;

  // Parent'ın görünen statusu: child_steps varsa onlardan türet (in_progress/finished güncel kalsın)
  const getEffectiveStatus = (step: ProjectStep): ProjectStep['status'] => {
    if (step.step_type === 'child' || !step.child_steps || step.child_steps.length === 0) {
      return step.status;
    }
    const allFinished = step.child_steps.every(
      (c) => c.status === 'finished' || c.manual_checkmark
    );
    const anyInProgress = step.child_steps.some((c) => c.status === 'in_progress');
    const anyStarted = step.child_steps.some(
      (c) => c.status === 'in_progress' || c.status === 'finished' || c.manual_checkmark
    );
    if (allFinished) return 'finished';
    if (anyInProgress || anyStarted) return 'in_progress';
    return 'pending';
  };

  const getStepProgressWidth = (status: ProjectStep['status']) => {
    switch (status) {
      case 'finished':
        return stepPercentage;
      case 'in_progress':
        return stepPercentage * 0.5;
      default:
        return 0;
    }
  };

  // Toplam ilerleme: karelerle aynı effective status kullanılıyor, çizgi güncel kalır
  const totalProgressPercent = sortedSteps.reduce(
    (sum, step) => sum + getStepProgressWidth(getEffectiveStatus(step)),
    0
  );
  const progressFillColor =
    sortedSteps.some((s) => getEffectiveStatus(s) === 'finished')
      ? '#22c55e'
      : sortedSteps.some((s) => getEffectiveStatus(s) === 'in_progress')
        ? '#f97316'
        : '#000000';

  const renderStepBox = (step: ProjectStep, index: number) => {
    const status = getEffectiveStatus(step);
    return (
      <TouchableOpacity
        key={step.id}
        style={styles.stepTouchable}
        onPress={() => step.name.length > 12 && setTooltipVisible(tooltipVisible === step.id ? null : step.id)}
        activeOpacity={step.name.length > 12 ? 0.7 : 1}
      >
        <View style={[styles.arrowSegment, { backgroundColor: getStepColor(status) }]}>
          <Text style={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          IS_MOBILE && totalSteps > 0 ? { minWidth: totalSteps * 84 } : {},
        ]}
      >
        {/* Bastan sona birleşik tek çizgi – doluluk soldan totalProgressPercent kadar */}
        <View style={styles.progressBarRow}>
          <View style={styles.progressBarTrack}>
            {totalProgressPercent > 0 && (
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${totalProgressPercent}%`, backgroundColor: progressFillColor },
                ]}
              />
            )}
          </View>
        </View>
        {/* Tüm kareler yan yana tek sıra */}
        <View style={styles.timelineRow}>
          {sortedSteps.map((step, index) => (
            <View key={step.id} style={[styles.stepColumn, totalSteps > 0 && !IS_MOBILE ? { flex: 1 } : {}]}>
              <View style={styles.boxRow}>
                {renderStepBox(step, index)}
              </View>
            </View>
          ))}
        </View>
        {/* Etiketler */}
        {showLabels && (
          <View style={styles.timelineRow}>
            {sortedSteps.map((step, index) => (
              <View key={`label-${step.id}`} style={[styles.stepColumn, totalSteps > 0 && !IS_MOBILE ? { flex: 1 } : {}]}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.stepLabel, { color: getStepColor(getEffectiveStatus(step)) }]} numberOfLines={2}>
                    {step.name.length > 12 ? step.name.substring(0, 12) + '...' : step.name}
                  </Text>
                </View>
                {tooltipVisible === step.id && step.name.length > 12 && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{step.name}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    ...(IS_MOBILE ? {} : { width: '100%' }),
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    ...(IS_MOBILE ? {} : { flex: 1 }),
  },
  stepColumn: {
    alignItems: 'center',
    position: 'relative',
    minWidth: 0,
    ...(IS_MOBILE ? { minWidth: 84 } : {}),
  },
  boxRow: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarRow: {
    width: '100%',
    height: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepTouchable: {
    alignItems: 'center',
  },
  arrowSegment: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  labelContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
    maxWidth: 80,
    alignItems: 'center',
  },
  labelContainerCompact: {
    maxWidth: 60,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  stepLabelCompact: {
    fontSize: 9,
    lineHeight: 11,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#000000',
    marginTop: 2,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
    minWidth: 120,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});