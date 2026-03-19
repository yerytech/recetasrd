import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { Comment } from '../types';
import { formatDateToSpanish } from '../utils/date';

type CommentItemProps = {
  comment: Comment;
};

/**
 * Ítem de comentario para detalle de receta.
 */
export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{comment.userName}</Text>
        <Text style={styles.date}>{formatDateToSpanish(comment.createdAt)}</Text>
      </View>

      <Text style={styles.content}>{comment.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
  content: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});