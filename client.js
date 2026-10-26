window.__ModuleLoader__.load({
  id: '@local/dsh-copy-image-menu',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'copy-image-menu';

    const zh = {
      downloadImage: '下载 PNG',
      rendering: '正在生成图片…',
      downloadStarted: '已开始下载 PNG',
      downloadFailed: '生成图片失败，请重试',
    };

    const en = {
      downloadImage: 'Download PNG',
      rendering: 'Rendering image…',
      downloadStarted: 'PNG download started',
      downloadFailed: 'Could not render the image',
    };

    const CSS = `
      .cim-download {
        width: calc(28px + var(--dsh-content-font-delta, 0px));
        height: calc(28px + var(--dsh-content-font-delta, 0px));
        border-radius: var(--dsw-radius-sm);
        color: var(--dsw-alias-label-tertiary);
        cursor: pointer;
        background: 0 0;
        border: none;
        justify-content: center;
        align-items: center;
        padding: 6px;
        display: inline-flex;
      }
      .cim-download svg {
        width: calc(17px + var(--dsh-content-font-delta, 0px));
        height: calc(17px + var(--dsh-content-font-delta, 0px));
      }
      .cim-download:hover {
        background: var(--dsw-alias-interactive-bg-hover);
        color: var(--dsw-alias-label-secondary);
      }
      .cim-download:focus-visible {
        outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
        outline-offset: 1px;
      }
      .cim-download:disabled {
        cursor: default;
        opacity: .7;
      }
      .cim-download[data-state="done"] { color: var(--dsw-alias-state-success-primary); }
      .cim-download[data-state="error"] { color: var(--dsw-alias-state-error-primary); }
      .cim-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: cim-spin .8s linear infinite;
      }
      @keyframes cim-spin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .cim-spinner { animation-duration: 2.4s; }
      }
    `;

    const ICONS = {
      download: () => h('svg', {
        viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
      h('path', { d: 'M12 3v11' }),
      h('path', { d: 'm8 10 4 4 4-4' }),
      h('path', { d: 'M5 20h14' })),
      check: () => h('svg', {
        viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
      h('path', { d: 'm5 12 4 4L20 6' })),
      alert: () => h('svg', {
        viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
      h('path', { d: 'M12 3 2 21h20L12 3Z' }),
      h('path', { d: 'M12 9v5M12 17h.01' })),
    };

    function token(name, fallback) {
      const value = getComputedStyle(document.body).getPropertyValue(name).trim();
      return value || fallback;
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

    function overflowRight(root) {
      const base = root.getBoundingClientRect();
      let right = base.width;
      for (const element of root.querySelectorAll('*')) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const edge = Math.max(rect.right - base.left, rect.left - base.left + element.scrollWidth);
        if (edge > right) right = edge;
      }
      return right;
    }

    async function renderMessagePng(tail) {
      const target = findAssistantStep(tail);
      if (target === null) throw new Error('assistant step not found');
      const MAX_CONTENT_WIDTH = 2000;
      const measuredWidth = Math.round(target.getBoundingClientRect().width);
      let contentWidth = measuredWidth >= 280 ? Math.min(MAX_CONTENT_WIDTH, measuredWidth) : 760;
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
          for (let attempt = 0; attempt < 3; attempt += 1) {
            const overflow = overflowRight(clone);
            if (overflow <= contentWidth + 1 || contentWidth >= MAX_CONTENT_WIDTH) break;
            contentWidth = Math.min(MAX_CONTENT_WIDTH, Math.ceil(overflow) + 12);
            clone.style.setProperty('width', `${contentWidth}px`);
            wrapper.style.setProperty('width', `${contentWidth + padding * 2 + 2}px`);
          }
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
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = '@local/dsh-copy-image-menu';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'copy-image-menu: styles');
        const translate = ctx.locale.bind(NS);

        function DownloadAction(props) {
          const t = props.t ?? translate;
          const [state, setState] = React.useState('idle');
          const buttonRef = React.useRef(null);
          const timerRef = React.useRef(null);

          React.useEffect(() => () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
          }, []);

          const resetLater = (delay) => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
              timerRef.current = null;
              setState('idle');
            }, delay);
          };

          const onClick = async () => {
            if (state === 'rendering') return;
            setState('rendering');
            try {
              const tail = buttonRef.current?.closest('[data-turn-tail]') ?? null;
              if (tail === null) throw new Error('turn tail not found');
              const blob = await renderMessagePng(tail);
              downloadBlob(blob);
              setState('done');
              resetLater(1400);
            } catch (error) {
              console.error('copy-image-menu: download render failed', error);
              setState('error');
              resetLater(2400);
            }
          };

          const label = state === 'rendering'
            ? t('rendering')
            : state === 'done'
              ? t('downloadStarted')
              : state === 'error'
                ? t('downloadFailed')
                : t('downloadImage');

          return h('button', {
            ref: buttonRef,
            type: 'button',
            className: 'cim-download',
            'data-state': state,
            'aria-label': label,
            title: label,
            disabled: state === 'rendering',
            onClick,
          },
          state === 'rendering'
            ? h('span', { className: 'cim-spinner', 'aria-hidden': true })
            : state === 'done'
              ? ICONS.check()
              : state === 'error'
                ? ICONS.alert()
                : ICONS.download());
        }

        ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
          name: 'conversation.chat.assistant-actions',
          id: 'download-image',
          order: 5,
          locale: NS,
        }, DownloadAction));
      },
    };
  },
});
