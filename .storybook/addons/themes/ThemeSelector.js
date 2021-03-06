import React from 'react';
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';

export default class ThemeSelector extends React.Component {
  state = {
    theme: localStorage.getItem('storybook.theme') || 'light',
    expanded: false,
  };

  changeTheme = theme => {
    this.setState({
      theme,
      expanded: false,
    });

    localStorage.setItem('storybook.theme', theme);

    location.reload(true);
  };

  handleVisibilityChange = expanded => {
    if (this.state.expanded !== expanded) {
      this.setState({ expanded });
    }
  };

  render() {
    const { expanded } = this.state;
    const links = [
      {
        id: 'light',
        title: 'Light',
        onClick: () => this.changeTheme('light'),
        value: 'light',
      },
      {
        id: 'dark',
        title: 'Dark',
        onClick: () => this.changeTheme('dark'),
        value: 'dark',
      },
    ];

    return (
      <WithTooltip
        placement="top"
        trigger="click"
        tooltipShown={expanded}
        onVisibilityChange={this.handleVisibilityChange}
        tooltip={<TooltipLinkList links={links} />}
        closeOnClick
      >
        <IconButton key="theme" title="Change the theme">
          <Icons icon="paintbrush" />
        </IconButton>
      </WithTooltip>
    );
  }
}
