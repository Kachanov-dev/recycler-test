import React, { useState, useEffect, useRef } from 'react';
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview/web';
import { mockedMessages, mockedMessages2 } from './mockedMessages';
import './style.scss';

const defaultWidth = window.innerWidth;
const defaultHeight = 500;

const Chat = () => {
  let recyclerRef = useRef();
  let recyclerWrapperRef = useRef();
  let scrollBarItemRef = useRef();
  let scrollBarWrapperRef = useRef();
  let isScrollBarPressed = true;
  let firstRenderRecycler = false;
  let layoutHeight = null;

  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1 !== r2;
    }).cloneWithRows(mockedMessages)
  );

  useEffect(() => {
    setDataProvider(dataProvider.cloneWithRows(mockedMessages));
  }, [mockedMessages.length]);

  const lazyLoadMessages = async () => {
    setDataProvider(dataProvider.cloneWithRows(mockedMessages2));
  };

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

  const renderMessage = (type, message, index) => {
    return <div className='message'>{message.message}</div>;
  };

  const scrollToBottom = () => {
    scrollToOffset(0);
  };

  const scrollToOffset = (offset) => {
    scrollBarWrapperRef.current.scrollTo({ top: offset });
    recyclerRef.scrollToOffset(0, offset, false);
  };

  const getScrollPosition = () => {
    return (
      layoutHeight - (layoutHeight - scrollBarWrapperRef.current.scrollTop)
    );
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
    if (firstRenderRecycler || !scrollBarWrapperRef.current) return;

    const height = recyclerRef?.getContentDimension()?.height || null;

    if (height) {
      layoutHeight = height;
      firstRenderRecycler = true;
      if (scrollBarItemRef.current?.style?.height) {
        scrollBarItemRef.current.style.height = `${height}px`;
      }
    } else return;

    recyclerWrapperRef.current.addEventListener('wheel', handleScroll, true);

    scrollBarWrapperRef.current.addEventListener(
      'mousedown',
      () => {
        isScrollBarPressed = true;
      },
      false
    );

    scrollBarWrapperRef.current.addEventListener(
      'mouseup',
      () => {
        isScrollBarPressed = false;
      },
      false
    );

    scrollBarWrapperRef.current.onscroll = () => {
      isScrollBarPressed = true;
      const newScrollOffset = getScrollPosition();
      if (isScrollBarPressed) {
        recyclerRef.scrollToOffset(0, newScrollOffset, false);
      }
    };
  };

  return (
    <div>
      <div className='chat-container'>
        <div ref={recyclerWrapperRef} className='recycler-wrapper'>
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
              recyclerRef = ref;
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
            initialOffset={0}
          />
        </div>
        <div
          ref={scrollBarWrapperRef}
          style={{
            height: `${defaultHeight}px`,
            overflowY: 'scroll',
            width: '25px',
            transform: 'scaleY(-1)',
          }}>
          <div
            ref={scrollBarItemRef}
            style={{
              height: '0px',
            }}></div>
        </div>
      </div>
      <div onClick={scrollToBottom} style={{ color: 'red' }}>
        Scroll to bottom
      </div>
    </div>
  );
};

export { Chat };
