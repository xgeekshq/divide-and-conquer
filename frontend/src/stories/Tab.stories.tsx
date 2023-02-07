import React from 'react';
import { ComponentStory } from '@storybook/react';

import Tab, { TabContent } from '@/components/Primitives/Tab';

export default {
  title: 'Primitives/Tab',
  component: Tab,
  parameters: {
    controls: {
      expanded: true,
      exclude: ['ref', 'as', 'css'],
      sort: 'requiredFirst',
    },
  },
  args: {
    tabList: [
      { value: 'participants', text: 'Participants' },
      { value: 'config', text: 'Configurations' },
    ],
  },
};

const Template: ComponentStory<typeof Tab> = ({ ...args }) => (
  <Tab {...args}>
    <TabContent value="participants">Content For Tab 1</TabContent>
    <TabContent value="config">Content For Tab 2</TabContent>
  </Tab>
);

export const Default = Template.bind({});
Default.storyName = 'Basic Usage';
