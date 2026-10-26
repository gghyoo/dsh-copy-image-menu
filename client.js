window.__ModuleLoader__.load({
  id: '@local/dsh-copy-image-menu',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'copy-image-menu';
    const MENU_WIDTH = 180;

    const zh = {
      menuLabel: '复制或下载',
      copyMarkdown: '复制 Markdown',
      copyMarkdownHint: '保留原始文本格式',
      downloadPng: '下载 PNG',
      downloadPngHint: '保存为图片文件',
      rendering: '正在生成图片…',
      imageDownloaded: '已开始下载 PNG',
      imageFailed: '生成图片失败，请重试',
      noMessage: '没有找到可复制的消息',
    };

    const en = {
      menuLabel: 'Copy or download',
      copyMarkdown: 'Copy Markdown',
      copyMarkdownHint: 'Keep the original text',
      downloadPng: 'Download PNG',
      downloadPngHint: 'Save the image as a file',
      rendering: 'Rendering image…',
      imageDownloaded: 'PNG download started',
      imageFailed: 'Could not render the image',
      noMessage: 'No message content found',
    };

    const CSS = `
      .cim-menu {
        position: fixed;
        z-index: 10000;
        box-sizing: border-box;
        padding: 6px;
        border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, .28));
        border-radius: 10px;
        background: var(--dsw-alias-bg-overlay, #202020);
        box-shadow: 0 14px 38px rgba(0, 0, 0, .24);
        color: var(--dsw-alias-label-primary, #f5f5f5);
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        pointer-events: auto;
      }
      .cim-menu__item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .cim-menu__item:hover,
      .cim-menu__item:focus-visible {
        background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .16));
        outline: none;
      }
      .cim-menu__icon {
        display: flex;
        flex: 0 0 16px;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--dsw-alias-label-secondary, #a8a8a8);
      }
      .cim-menu__text {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .cim-menu__title {
        font-size: 13px;
        line-height: 18px;
        white-space: nowrap;
      }
      .cim-menu__hint {
        font-size: 11px;
        line-height: 15px;
        color: var(--dsw-alias-label-secondary, #a0a0a0);
        white-space: nowrap;
      }
      .cim-toast {
        position: fixed;
        left: 50%;
        bottom: 30px;
        z-index: 10003;
        box-sizing: border-box;
        max-width: min(86vw, 520px);
        padding: 8px 14px;
        border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, .28));
        border-radius: 999px;
        background: var(--dsw-alias-bg-overlay, #202020);
        box-shadow: 0 10px 28px rgba(0, 0, 0, .22);
        color: var(--dsw-alias-label-primary, #f5f5f5);
        font: 12px/18px system-ui, -apple-system, "Segoe UI", sans-serif;
        text-align: center;
        transform: translateX(-50%);
        pointer-events: none;
        white-space: nowrap;
      }
      .cim-toast[data-tone="success"] { color: var(--dsw-alias-state-success-primary, #34d399); }
      .cim-toast[data-tone="error"] { color: var(--dsw-alias-state-error-primary, #f87171); }
    `;

    const ICONS = {
      markdown: () => h('svg', {
        viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
      h('path', { d: 'M5 3h9l5 5v13H5z' }),
      h('path', { d: 'M14 3v5h5' }),
      h('path', { d: 'M8 12h8M8 16h6' })),
      download: () => h('svg', {
        viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
      h('path', { d: 'M12 3v11' }),
      h('path', { d: 'm8 10 4 4 4-4' }),
      h('path', { d: 'M5 20h14' })),
    };

    function MenuItem({ icon, title, hint, onClick }) {
      return h('button', {
        type: 'button',
        className: 'cim-menu__item',
        role: 'menuitem',
        onClick,
      },
      h('span', { className: 'cim-menu__icon' }, icon()),
      h('span', { className: 'cim-menu__text' },
        h('span', { className: 'cim-menu__title' }, title),
        h('span', { className: 'cim-menu__hint' }, hint)));
    }

    function createStore() {
      let state = {
        open: false,
        left: 8,
        top: 8,
        button: null,
        toast: null,
      };
      const listeners = new Set();
      return {
        get() { return state; },
        set(patch) {
          state = { ...state, ...patch };
          for (const listener of [...listeners]) listener();
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
      };
    }

    function token(name, fallback) {
      const value = getComputedStyle(document.body).getPropertyValue(name).trim();
      return value || fallback;
    }

    function isCopyButton(target) {
      if (!(target instanceof Element)) return null;
      const button = target.closest('button');
      if (!(button instanceof HTMLButtonElement)) return null;
      const row = button.closest('[data-turn-tail] [data-clock="end"]');
      if (row === null) return null;
      return row.querySelector('button') === button ? button : null;
    }

    function findAssistantStep(tail) {
      if (tail === null) return null;
      let cursor = tail.closest('[data-chat-flow-kind="turn-tail"]') ?? tail;
      while (cursor !== null) {
        cursor = cursor.previousElementSibling;
        if (cursor === null) break;
        if (cursor.matches('[data-chat-flow-kind="assistant-step"]')) return cursor;
        const nested = cursor.querySelectorAll('[data-chat-flow-kind="assistant-step"]');
        if (nested.length > 0) return nested[nested.length - 1];
      }
      return null;
    }

    const STYLE_SKIP = new Set([
      'position', 'inset', 'top', 'right', 'bottom', 'left', 'z-index',
      'transform', 'translate', 'rotate', 'scale', 'transform-origin',
      'transition', 'animation', 'animation-name', 'animation-duration',
      'animation-delay', 'animation-iteration-count', 'animation-direction',
      'will-change', 'cursor', 'pointer-events', 'user-select',
      'overflow', 'overflow-x', 'overflow-y',
      'background-image', 'border-image-source', 'list-style-image',
      'mask', 'mask-image', 'filter', 'backdrop-filter', 'clip-path',
    ]);

    function copyComputedTree(source, clone) {
      if (!(source instanceof Element) || !(clone instanceof Element)) return;
      const computed = getComputedStyle(source);
      const style = clone.style;
      for (let index = 0; index < computed.length; index += 1) {
        const property = computed[index];
        if (STYLE_SKIP.has(property)) continue;
        if (property === 'height' || property === 'min-height' || property === 'max-height') {
          if (source.tagName !== 'IMG' && source.tagName !== 'svg') continue;
        }
        const value = computed.getPropertyValue(property);
        if (value === '') continue;
        style.setProperty(property, value, computed.getPropertyPriority(property));
      }
      style.setProperty('position', 'static');
      style.setProperty('cursor', 'default');
      style.setProperty('overflow', 'visible');
      style.setProperty('animation', 'none');
      style.setProperty('transition', 'none');
      if (source.tagName === 'PRE') {
        style.setProperty('height', 'auto');
        style.setProperty('max-height', 'none');
      }
      if (source.tagName === 'CODE' && source.closest('pre') === null && (source.textContent ?? '').length <= 40) {
        style.setProperty('white-space', 'nowrap');
        style.setProperty('overflow-wrap', 'normal');
        style.setProperty('word-break', 'normal');
      }
      const sourceChildren = source.children;
      const cloneChildren = clone.children;
      const length = Math.min(sourceChildren.length, cloneChildren.length);
      for (let index = 0; index < length; index += 1) {
        copyComputedTree(sourceChildren[index], cloneChildren[index]);
      }
    }

    function textToBase64(text) {
      const bytes = new TextEncoder().encode(text);
      let binary = '';
      const chunk = 0x8000;
      for (let index = 0; index < bytes.length; index += chunk) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
      }
      return btoa(binary);
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
        reader.readAsDataURL(blob);
      });
    }

    async function inlineImages(root) {
      const images = [...root.querySelectorAll('img')];
      await Promise.all(images.map(async (image) => {
        const src = image.currentSrc || image.src;
        if (src === '' || src.startsWith('data:')) return;
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error(`image ${response.status}`);
          const dataUrl = await blobToDataUrl(await response.blob());
          image.setAttribute('src', dataUrl);
          image.removeAttribute('srcset');
        } catch {
          image.removeAttribute('src');
          image.removeAttribute('srcset');
          image.style.display = 'none';
        }
      }));
    }

    function loadSvgImage(url) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        const timer = window.setTimeout(() => reject(new Error('image render timeout')), 15000);
        image.onload = () => {
          window.clearTimeout(timer);
          resolve(image);
        };
        image.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error('image render failed'));
        };
        image.src = url;
      });
    }

    function canvasToBlob(canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob === null) reject(new Error('canvas toBlob failed'));
          else resolve(blob);
        }, 'image/png');
      });
    }

    async function renderPlainTextPng(target) {
      const text = (target.innerText || target.textContent || '').replace(/\r\n?/g, '\n');
      const width = 900;
      const padding = 36;
      const lineHeight = 24;
      const font = `14px ${getComputedStyle(target).fontFamily || 'system-ui, sans-serif'}`;
      const background = token('--dsw-alias-bg-layer-1', getComputedStyle(document.body).backgroundColor || '#ffffff');
      const foreground = getComputedStyle(target).color || '#111111';
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context === null) throw new Error('canvas context unavailable');
      context.font = font;
      const maxWidth = width - padding * 2;
      const lines = [];
      for (const paragraph of text.split('\n')) {
        if (paragraph === '') {
          lines.push('');
          continue;
        }
        let line = '';
        for (const character of paragraph) {
          const next = line + character;
          if (line !== '' && context.measureText(next).width > maxWidth) {
            lines.push(line);
            line = character;
          } else {
            line = next;
          }
        }
        lines.push(line);
      }
      const maxLines = Math.max(1, Math.floor((16000 - padding * 2) / lineHeight));
      const clipped = lines.slice(0, maxLines);
      if (lines.length > maxLines) clipped[maxLines - 1] = `${clipped[maxLines - 1]} …`;
      canvas.width = width;
      canvas.height = Math.max(1, padding * 2 + clipped.length * lineHeight);
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = font;
      context.fillStyle = foreground;
      context.textBaseline = 'top';
      clipped.forEach((line, index) => {
        context.fillText(line, padding, padding + index * lineHeight);
      });
      return canvasToBlob(canvas);
    }

    async function renderMessagePng(tail) {
      const target = findAssistantStep(tail);
      if (target === null) throw new Error('assistant step not found');
      const measuredWidth = Math.round(target.getBoundingClientRect().width);
      const contentWidth = measuredWidth >= 280 ? Math.min(920, measuredWidth) : 760;
      const clone = target.cloneNode(true);
      copyComputedTree(target, clone);
      clone.style.setProperty('width', `${contentWidth}px`);
      clone.style.setProperty('max-width', 'none');
      clone.style.setProperty('margin', '0');
      await inlineImages(clone);

      const sourceStyle = getComputedStyle(target);
      const background = token('--dsw-alias-bg-layer-1', getComputedStyle(document.body).backgroundColor || '#ffffff');
      const border = token('--dsw-alias-border-l1', 'rgba(127, 127, 127, .26)');
      const padding = 28;
      const wrapper = document.createElement('div');
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrapper.style.cssText = [
        'box-sizing:border-box',
        `width:${contentWidth + padding * 2 + 2}px`,
        `padding:${padding}px`,
        `background:${background}`,
        `border:1px solid ${border}`,
        'border-radius:14px',
        `color:${sourceStyle.color || '#111111'}`,
        `font-family:${sourceStyle.fontFamily || 'system-ui, sans-serif'}`,
        `font-size:${sourceStyle.fontSize || '14px'}`,
        `line-height:${sourceStyle.lineHeight || '1.65'}`,
      ].join(';');
      wrapper.appendChild(clone);

      const stage = document.createElement('div');
      stage.style.cssText = 'position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;';
      stage.appendChild(wrapper);
      document.body.appendChild(stage);

      try {
        try {
        const width = Math.ceil(wrapper.getBoundingClientRect().width);
        const height = Math.ceil(Math.max(wrapper.scrollHeight, wrapper.getBoundingClientRect().height));
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', '0');
        foreignObject.setAttribute('y', '0');
        foreignObject.setAttribute('width', String(width));
        foreignObject.setAttribute('height', String(height));
        foreignObject.appendChild(wrapper);
        svg.appendChild(foreignObject);

        const svgText = new XMLSerializer().serializeToString(svg);
        const imageUrl = `data:image/svg+xml;base64,${textToBase64(svgText)}`;
        const image = await loadSvgImage(imageUrl);
        const scale = Math.max(0.5, Math.min(2, 16000 / height, 12000 / width));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext('2d');
        if (context === null) throw new Error('canvas context unavailable');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.scale(scale, scale);
        context.drawImage(image, 0, 0, width, height);
        return await canvasToBlob(canvas);
        } catch (error) {
          console.warn('copy-image-menu: styled render failed, using text fallback', error);
          return await renderPlainTextPng(target);
        }
      } finally {
        stage.remove();
      }
    }

    function downloadBlob(blob, name = `dsh-message-${Date.now()}.png`) {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'copy-image-menu: dictionaries');
        const translate = ctx.locale.bind(NS);
        const store = createStore();
        let bypassButton = null;
        let toastTimer = null;

        const showToast = (text, tone = 'info', duration = 1800) => {
          if (toastTimer !== null) window.clearTimeout(toastTimer);
          toastTimer = null;
          store.set({ toast: { text, tone } });
          if (duration > 0) {
            toastTimer = window.setTimeout(() => {
              toastTimer = null;
              store.set({ toast: null });
            }, duration);
          }
        };

        const closeMenu = () => store.set({ open: false });

        const openMenu = (button) => {
          const rect = button.getBoundingClientRect();
          const estimatedHeight = 104;
          const left = Math.min(
            Math.max(8, rect.right - MENU_WIDTH),
            Math.max(8, window.innerWidth - MENU_WIDTH - 8),
          );
          let top = rect.bottom + 7;
          if (top + estimatedHeight > window.innerHeight - 8) {
            top = Math.max(8, rect.top - estimatedHeight - 7);
          }
          store.set({ open: true, left, top, button });
        };

        const copyMarkdown = () => {
          const button = store.get().button;
          closeMenu();
          if (!(button instanceof HTMLButtonElement) || !button.isConnected) {
            showToast(translate('noMessage'), 'error');
            return;
          }
          bypassButton = button;
          button.click();
          window.setTimeout(() => {
            if (bypassButton === button) bypassButton = null;
          }, 1000);
        };

        const downloadImage = async () => {
          const button = store.get().button;
          closeMenu();
          if (!(button instanceof HTMLButtonElement) || !button.isConnected) {
            showToast(translate('noMessage'), 'error');
            return;
          }
          const tail = button.closest('[data-turn-tail]');
          showToast(translate('rendering'), 'info', 0);
          try {
            const blob = await renderMessagePng(tail);
            downloadBlob(blob);
            showToast(translate('imageDownloaded'), 'info', 1800);
          } catch (error) {
            console.error('copy-image-menu: download render failed', error);
            showToast(translate('imageFailed'), 'error', 2600);
          }
        };

        const onDocumentClick = (event) => {
          const button = isCopyButton(event.target);
          if (button === null) return;
          if (bypassButton === button) {
            bypassButton = null;
            return;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          openMenu(button);
        };

        ctx.effect(() => {
          document.addEventListener('click', onDocumentClick, true);
          return () => document.removeEventListener('click', onDocumentClick, true);
        }, 'copy-image-menu: click interception');

        ctx.effect(() => () => {
          if (toastTimer !== null) window.clearTimeout(toastTimer);
          toastTimer = null;
        }, 'copy-image-menu: toast timer');

        function CopyOverlay(props) {
          const t = props.t ?? translate;
          const state = React.useSyncExternalStore(store.subscribe, store.get, store.get);
          const menuRef = React.useRef(null);

          React.useEffect(() => {
            if (!state.open) return undefined;
            const onPointerDown = (event) => {
              if (menuRef.current !== null && !menuRef.current.contains(event.target)) closeMenu();
            };
            const onKeyDown = (event) => {
              if (event.key !== 'Escape') return;
              const button = store.get().button;
              closeMenu();
              if (button instanceof HTMLButtonElement) button.focus();
            };
            const onViewportChange = () => closeMenu();
            document.addEventListener('pointerdown', onPointerDown, true);
            document.addEventListener('keydown', onKeyDown, true);
            window.addEventListener('scroll', onViewportChange, true);
            window.addEventListener('resize', onViewportChange);
            const first = menuRef.current?.querySelector('button');
            if (first instanceof HTMLElement) first.focus({ preventScroll: true });
            return () => {
              document.removeEventListener('pointerdown', onPointerDown, true);
              document.removeEventListener('keydown', onKeyDown, true);
              window.removeEventListener('scroll', onViewportChange, true);
              window.removeEventListener('resize', onViewportChange);
            };
          }, [state.open]);

          return h(React.Fragment, null,
            h('style', null, CSS),
            state.open ? h('div', {
              ref: menuRef,
              className: 'cim-menu',
              role: 'menu',
              'aria-label': t('menuLabel'),
              style: { left: `${state.left}px`, top: `${state.top}px`, width: `${MENU_WIDTH}px` },
            },
            h(MenuItem, {
              icon: ICONS.markdown,
              title: t('copyMarkdown'),
              hint: t('copyMarkdownHint'),
              onClick: copyMarkdown,
            }),
            h(MenuItem, {
              icon: ICONS.download,
              title: t('downloadPng'),
              hint: t('downloadPngHint'),
              onClick: downloadImage,
            })) : null,
            state.toast === null ? null : h('div', {
              className: 'cim-toast',
              'data-tone': state.toast.tone,
              role: 'status',
              'aria-live': 'polite',
            }, state.toast.text));
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'copy-image-menu.overlay',
          order: 1000,
          locale: NS,
        }, CopyOverlay));
      },
    };
  },
});
