import React, { forwardRef, memo } from 'react';
import { Text } from 'react-native';
import { headingStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof Text> & {
    as?: React.ElementType;
  };

const MappedHeading = memo(
  forwardRef<React.ComponentRef<typeof Text>, IHeadingProps>(function MappedHeading(
    {
      size,
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
      ...props
    },
    ref
  ) {
    return (
      <Text
        accessibilityRole="header"
        className={headingStyle({
          size,
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        {...props}
        ref={ref}
      />
    );
  })
);

const Heading = memo(
  forwardRef<React.ComponentRef<typeof Text>, IHeadingProps>(function Heading(
    { className, size = 'lg', as: AsComp, ...props },
    ref
  ) {
    const { isTruncated, bold, underline, strikeThrough, sub, italic, highlight } = props;

    if (AsComp) {
      return (
        <AsComp
          accessibilityRole="header"
          className={headingStyle({
            size,
            isTruncated: isTruncated as boolean,
            bold: bold as boolean,
            underline: underline as boolean,
            strikeThrough: strikeThrough as boolean,
            sub: sub as boolean,
            italic: italic as boolean,
            highlight: highlight as boolean,
            class: className,
          })}
          {...props}
        />
      );
    }

    return <MappedHeading className={className} size={size} ref={ref} {...props} />;
  })
);

Heading.displayName = 'Heading';

export { Heading };
