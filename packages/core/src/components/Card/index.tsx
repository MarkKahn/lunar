import React from 'react';
import childrenWithComponentName from '../../prop-types/childrenWithComponentName';
import Content from './Content';
import useStyles from '../../hooks/useStyles';
import { Theme } from '../../types';

export { Content };

const styleSheet = ({ color, pattern }: Theme) => ({
  card: {
    ...pattern.box,
    background: color.accent.bg,
    overflow: 'hidden',
  },
});

export type Props = {
  /** List of `Content`s blocks to contain content. */
  children: NonNullable<React.ReactNode>;
};

/**
 * An abstract layout to use as a base for cards.
 */
function Card({ children }: Props) {
  const [styles, cx] = useStyles(styleSheet, 'Card');

  return <div className={cx(styles.card)}>{children}</div>;
}

Card.propTypes = {
  children: childrenWithComponentName('CardContent').isRequired,
};

export default Card;
