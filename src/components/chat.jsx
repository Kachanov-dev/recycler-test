import React, { useState, useEffect, useRef } from 'react';
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview/web';
import { mockedMessages } from './mockedMessages';
import './style.scss';

const ChatMain = () => {
  return <Chat />;
};

class Chat extends React.Component {
  previousScrollOffset = null;
  chatListRef = null;
  _layoutProvider = null;
  scrollBarWrapper = null;
  recyclerScrollWrap = null;
  isScrollBarPressed = false;
  fullHeightOfLayout = 0;
  firstRenderRecycler = false;

  constructor(props) {
    super(props);

    this.previousScrollOffset = 0;
    this._layoutProvider = new LayoutProvider(
      (index) => {
        return index;
      },
      (type, dim) => {
        dim.height = 50;
        dim.width = window.innerWidth;
      }
    );

    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this.state = {
      loading: false,
      downloading: false,
      isScrollButton: false,
      isAttachmentPicker: false,
      isGoogleMapsPicker: false,
      isVisibleHeaderMenu: false,
      dataProvider: dataProvider.cloneWithRows(mockedMessages),
      currentStickyDateBadgeDay: '',
      selectedMessagesIds: [],
      selectedMessages: [],
      textsToCopyMap: {},
      repliedMessage: null,
      editMessage: null,
      stateModal: false,
      isContextMenuModal: false,
      contactInfoModal: false,
      forceUpdateRecycler: false,
      isDragAndDropModal: false,
      chatPosition: 0,
      islazyShowMessages: true,
    };
  }

  scrollToBottom = () => {
    requestAnimationFrame(() => {
      this.scrollToOffset(0);
    });
  };

  scrollToOffset = (offset) => {
    this.chatListRef.scrollToOffset(0, offset, false);
  };

  renderMessage = (type, message, index) => {
    return (
      <div
        style={{
          height: '50px',
          border: '1px solid red',
          transform: 'scaleY(-1)',
        }}>
        {index}
      </div>
    );
  };

  setLoading = (state) => {
    this.setState({ loading: state });
  };

  offsetPositionChat = (height) => {
    this.setState({ chatPosition: height });
  };

  handleScroll = (e) => {
    // basic scrolling is very fast so we add deltaScrollSpeed
    const deltaScrollSpeed = e.deltaY * 0.5;
    const scrollStep =
      this.chatListRef.getCurrentScrollOffset() - e.deltaY + deltaScrollSpeed;
    this.scrollToOffset(scrollStep);
  };

  initRecyclerListeners = (forceReRender) => {
    if (forceReRender) {
      this.fullHeightOfLayout = 0;
      this.firstRenderRecycler = false;
    }

    if (this.firstRenderRecycler) return;
    const height = this.chatListRef?.getContentDimension()?.height || null;
    if (height) {
      this.fullHeightOfLayout = height;
      this.firstRenderRecycler = true;
      const scrollbar = document.getElementById('scrollBarItem');
      if (scrollbar?.style?.height) {
        scrollbar.style.height = `${height}px`;
      }
    } else {
      return;
    }

    this.recyclerScrollWrap = document.getElementById('recyclerScrollWrap');
    this.scrollBarWrapper = document.getElementById('scrollBarWrapper');

    this.recyclerScrollWrap.addEventListener('wheel', this.handleScroll, true);

    this.scrollBarWrapper.addEventListener(
      'mousedown',
      () => {
        this.isScrollBarPressed = true;
      },
      false
    );

    this.scrollBarWrapper.addEventListener(
      'mouseup',
      () => {
        this.isScrollBarPressed = false;
      },
      false
    );

    this.scrollBarWrapper.onscroll = () => {
      const newScrollOffset = this.getCurrentScrollPosition();
      if (this.isScrollBarPressed) {
        this.chatListRef.scrollToOffset(0, newScrollOffset, false);
      }
    };

    this.setState({ islazyShowMessages: false });
  };

  onScrollHandler = (elem, x, y) => {
    const { isScrollButton } = this.state;
    if (y > 200 && !isScrollButton) {
      this.setState({ isScrollButton: true });
    } else if (y < 200 && isScrollButton) {
      this.setState({ isScrollButton: false });
    }
  };

  getCurrentScrollPosition = () => {
    if (!this.scrollBarWrapper?.scrollTop) {
      return 0;
    }
    return (
      this.fullHeightOfLayout -
      (this.fullHeightOfLayout - this.scrollBarWrapper.scrollTop)
    );
  };

  render() {
    const {
      dataProvider,
      selectedMessagesIds,
      chatPosition,
      islazyShowMessages,
    } = this.state;
    const dataSize = dataProvider?.getAllData?.().length;

    ///

    const defaultWidth = window.innerWidth;
    const defaultHeight = 500;

    const backgroundStyle = {
      backgroundColor: `pink`,
      height: defaultHeight,
    };

    const stylesWrap = {
      height: '500px',
      width: `100%`,
      display: `flex`,
      flexDirection: `column`,
      alignItems: `stretch`,
      justifyContent: `space-between`,
      overflow: `hidden`,
      padding: '0',
      backgroundColor: 'white',
    };

    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <div style={stylesWrap}>
          <div
            style={{
              height: `${defaultHeight}px`,
            }}
            className='chat-conversation1'>
            <div className='chat-conversation-list1' style={backgroundStyle}>
              {dataSize > 0 ? (
                <div
                  id='recyclerScrollWrap'
                  className='chat-conversation-list-wrapper1'
                  style={
                    islazyShowMessages
                      ? {
                          opacity: 0,
                        }
                      : {
                          opacity: 1,
                          transition: 'opacity 0.2s ease-in-out',
                        }
                  }>
                  <>
                    <RecyclerListView
                      style={{
                        width: defaultWidth,
                        height: defaultHeight,
                        overflowY: 'hidden',
                        transform: 'scaleY(-1)',
                      }}
                      ref={(ref) => {
                        this.chatListRef = ref;
                        this.initRecyclerListeners(false);
                      }}
                      dataProvider={dataProvider}
                      layoutProvider={this._layoutProvider}
                      rowRenderer={this.renderMessage}
                      extendedState={{
                        dataProvider,
                        selectedMessagesIds,
                      }}
                      initialOffset={this.previousScrollOffset}
                      renderAheadOffset={500}
                      canChangeSize
                      // onEndReachedThreshold={100}
                      // onVisibleIndicesChanged={(indexes) =>
                      //   this._renderStickyDateBage(indexes)
                      // }
                    />
                    <div
                      id='scrollBarWrapper'
                      style={{
                        position: 'relative',
                        height: `${defaultHeight}px`,
                        width: '25px',
                        overflowY: 'scroll',
                        transform: 'scaleY(-1)',
                      }}>
                      <div
                        id='scrollBarItem'
                        style={{
                          height: '0px',
                        }}></div>
                    </div>
                  </>
                </div>
              ) : (
                <div
                  style={{
                    width: defaultWidth,
                    height: defaultHeight,
                  }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { ChatMain };
