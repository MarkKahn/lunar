import React from 'react';
import childrenWithComponentName from '../../prop-types/childrenWithComponentName';
import withStyles, { css, WithStylesProps } from '../../composers/withStyles';
import { Props as ProfilePhotoProps } from '../ProfilePhoto';

/* eslint-disable react/no-array-index-key */

export type Props = {
  /** List of `ProfilePhoto` components to group. */
  children: NonNullable<React.ReactNode>;
  /** Max number of photos to display before truncating. */
  max?: number;
  /** Size in units to multiply by. */
  size?: number;
};

/** Horizontally align `ProfilePhoto`s in a stacked fashion. */
export class ProfilePhotoGroup extends React.Component<Props & WithStylesProps> {
  static propTypes = {
    children: childrenWithComponentName('ProfilePhoto').isRequired,
  };

  static defaultProps = {
    max: 3,
    size: 5,
  };

  render() {
    const { children, max, size, styles, theme } = this.props as Required<Props & WithStylesProps>;
    const { unit } = theme;
    const margin = { marginLeft: -(size * (unit / 2.5)) };
    let photos = React.Children.toArray(children).filter(child => !!child);
    let remainder = 0;

    if (max && photos.length > max) {
      remainder = photos.length - max;
      photos = photos.slice(0, max);
    }

    return (
      <div {...css(styles.group)}>
        {photos.map((photo, i) => (
          <div key={i} {...css(styles.cell, margin)}>
            {React.cloneElement(photo as React.ReactElement<ProfilePhotoProps>, {
              size,
              inline: false,
              square: false,
            })}
          </div>
        ))}

        {remainder > 0 && (
          <div key="remainder" {...css(styles.cell, margin)}>
            <div
              {...css(styles.remainder, {
                height: size * unit,
                maxHeight: size * unit,
                maxWidth: size * unit,
                width: size * unit,
              })}
            >
              <span {...css(styles.remainderNumber)}>{`+${remainder}`}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(
  ({ color, font }) => ({
    group: {
      display: 'flex',
      alignItems: 'stretch',
    },

    cell: {
      borderRadius: '50%',
      border: `1px solid ${color.base}`,
      background: color.core.neutral[6],

      ':first-of-type': {
        marginLeft: 0,
      },

      ':empty': {
        display: 'none',
      },
    },

    remainder: {
      ...font.textRegular,
      position: 'relative',
    },

    remainderNumber: {
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      top: '50%',
      left: '50%',
      color: color.base,
    },
  }),
  {
    passThemeProp: true,
  },
)(ProfilePhotoGroup);
