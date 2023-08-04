import React, { useState, useEffect, useRef } from 'react';
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview/web';
import { mockedMessages } from './mockedMessages';
import './style.scss';

const defaultWidth = 500;
const defaultHeight = 500;

const NewChat = () => {
  let recyclerRef = useRef();
  let previousScrollOffset = null;
  let scrollBarWrapper = null;
  let isScrollBarPressed = false;
  let firstRenderRecycler = false;
  let recyclerScrollWrap = null;
  let fullHeightOfLayout = null;

  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1 !== r2;
    }).cloneWithRows(mockedMessages.reverse())
  );

  let layoutProvider = useRef(
    new LayoutProvider(
      (index) => {
        return index;
      },
      (type, dim) => {
        dim.height = 100;
        dim.width = window.innerWidth;
      }
    )
  );

  useEffect(() => {
    previousScrollOffset = recyclerRef?.getCurrentScrollOffset();
    setDataProvider(dataProvider.cloneWithRows(mockedMessages));
  }, [mockedMessages.length]);

  const renderMessage = (type, item, index) => {
    return <div className='message'>{item.message}</div>;
  };

  const setRef = (ref) => {
    if (ref) {
      recyclerRef = ref;
    }
  };

  const scrollToBottom = () => {
    scrollToOffset(0);
  };

  const scrollToOffset = (offset) => {
    recyclerRef.scrollToOffset(0, offset, false);
  };

  const lazyLoadMessages = async () => {};

  const getCurrentScrollPosition = () => {
    return (
      fullHeightOfLayout - (fullHeightOfLayout - scrollBarWrapper.scrollTop)
    );
    // if (scrollBarWrapper?.scrollTop) {
    //   return 0;
    // }
  };

  const handleScroll = (e) => {
    // basic scrolling is very fast so we add
    if (!recyclerRef) return;
    const deltaScrollSpeed = e.deltaY * 0.5;
    const scrollStep =
      recyclerRef.getCurrentScrollOffset() - e.deltaY + deltaScrollSpeed;
    scrollToOffset(scrollStep);
  };

  const initRecyclerListeners = () => {
    if (firstRenderRecycler) return;

    const height = recyclerRef?.getContentDimension()?.height || null;

    if (height) {
      fullHeightOfLayout = height;
      firstRenderRecycler = true;
      const scrollbar = document.getElementById('scrollBarItem');
      if (scrollbar?.style?.height) {
        scrollbar.style.height = `${height}px`;
      }
    } else {
      return;
    }

    recyclerScrollWrap = document.getElementById('recyclerScrollWrap');
    scrollBarWrapper = document.getElementById('scrollBarWrapper');

    recyclerScrollWrap.addEventListener('wheel', handleScroll, true);

    scrollBarWrapper.addEventListener(
      'mousedown',
      () => {
        isScrollBarPressed = true;
      },
      false
    );

    scrollBarWrapper.addEventListener(
      'mouseup',
      () => {
        isScrollBarPressed = false;
      },
      false
    );

    scrollBarWrapper.onscroll = () => {
      const newScrollOffset = getCurrentScrollPosition();
      if (isScrollBarPressed) {
        recyclerRef.scrollToOffset(0, newScrollOffset, false);
      }
    };
  };

  const backgroundStyle = {
    backgroundColor: `pink`,
    height: defaultHeight,
  };

  const stylesWrap = {
    height: '500px',
    width: '500px',
    display: `flex`,
    flexDirection: `column`,
    alignItems: `stretch`,
    justifyContent: `space-between`,
    overflow: `hidden`,
    padding: '0',
    backgroundColor: 'white',
  };

  return (
    <div style={stylesWrap}>
      <div className='chat-conversation' style={backgroundStyle}>
        <div id='recyclerScrollWrap' className='chat-wrapper'>
          <RecyclerListView
            style={{
              width: defaultWidth,
              height: defaultHeight,
              overflowY: 'hidden',
              transform: 'scaleY(-1)',
            }}
            rowRenderer={renderMessage}
            layoutProvider={layoutProvider.current}
            ref={(ref) => {
              setRef(ref);
              initRecyclerListeners(false);
            }}
            dataProvider={dataProvider}
            extendedState={{
              dataProvider,
            }}
            renderAheadOffset={500}
            onEndReached={lazyLoadMessages}
            canChangeSize
            onEndReachedThreshold={100}
            // initialOffset={this.previousScrollOffset}
            // onVisibleIndicesChanged={(indexes) =>
            //   this._renderStickyDateBage(indexes)
            // }
          />
          <div
            id='scrollBarWrapper'
            style={{
              height: `${defaultHeight}px`,
              overflowY: 'scroll',
              width: '25px',
              transform: 'scaleY(-1)',
            }}>
            <div
              id='scrollBarItem'
              style={{
                height: '0px',
              }}></div>
          </div>
        </div>
        <div onClick={scrollToBottom}>Scroll to bottom</div>
      </div>
    </div>
  );
};

export { NewChat };
