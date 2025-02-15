import React from 'react';
import { ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';

const MarkdownText = ({ text }: { text: string }) => {
  return (
    <ScrollView>
      <Markdown>
        {text}
      </Markdown>
    </ScrollView>
  );
};

export { MarkdownText };