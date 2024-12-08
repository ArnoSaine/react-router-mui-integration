import { forwardRef } from "react";
import type { LinkProps } from "react-router";
import { Link } from "react-router";

export const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, "to"> & { href: LinkProps["to"] }
>(
  (
    { href, ...other }: { href: LinkProps["to"] },
    ref: React.ForwardedRef<HTMLAnchorElement>
  ) => <Link ref={ref} to={href} {...other} />
);

export const theme = {
  components: {
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      },
    },
  },
};
