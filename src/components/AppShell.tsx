import React from 'react';
import { useReaderStore } from '../store/readerStore';
import { useAutoHide } from '../hooks/useAutoHide';
import ReaderView from './reader/ReaderView';
import Toolbar from './controls/Toolbar';
import ProgressBar from './controls/ProgressBar';
import SettingsPanel from './controls/SettingsPanel';
import TableOfContents from './controls/TableOfContents';
import SearchPanel from './controls/SearchPanel';
import BookmarkList from './controls/BookmarkList';

/**
 * AppShell wraps the reader view with all overlaid controls.
 * Controls auto-hide during immersive reading.
 */
const AppShell: React.FC = () => {
  const isImmersive = useReaderStore((s) => s.isImmersive);
  const { visible: controlsVisible } = useAutoHide(isImmersive ? 2500 : 60000);

  const showControls = isImmersive ? controlsVisible : true;

  return (
    <div className="relative w-full h-full">
      {/* Main reader content */}
      <ReaderView />

      {/* Toolbar (top) */}
      <Toolbar visible={showControls} />

      {/* Progress bar (bottom) */}
      <ProgressBar visible={showControls} />

      {/* Side panels */}
      <SettingsPanel />
      <TableOfContents />
      <SearchPanel />
      <BookmarkList />
    </div>
  );
};

export default AppShell;
