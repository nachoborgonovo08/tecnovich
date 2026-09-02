import { useMemo, type CSSProperties } from "react";

type FocusRole = "background" | "button" | "visual";
type EffectMode = "light" | "dark";

type FocusTarget = {
  selector: string;
  role: FocusRole;
  preserveTransform?: boolean;
};

type EffectDefinition = {
  title: string;
  source: string;
  background: string;
  targets: readonly FocusTarget[];
  theme?: {
    lightBackground: string;
    darkBackground: string;
  };
};

export type DotBorderButtonProps = {
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

const DOT_BORDER_BUTTON_DEFAULTS = {
  mode: "dark",
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

// Fuente HTML del efecto (idem MengTo/threeui). El botón se aísla vía data-threeui-role.
const buildSource = (label: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    body { height: 100%; overflow: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; }
    .component-wrapper { width: 100%; height: 100%; padding: 0; box-sizing: border-box; overflow: auto; }
  </style>
</head>
<body>
  <div class="component-wrapper">
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#000;">
      <a href="#" class="btn-wrapper" style="--dot-size:8px;--line-weight:1px;--line-distance:0.8rem 1rem;--animation-speed:0.35s;--dot-color:#fffa;--line-color:#fffa;--grid-color:#fff3;position:relative;display:inline-flex;justify-content:center;align-items:center;padding:var(--line-distance);background-color:rgba(0,0,0,0);user-select:none">
        <style>
          .btn-wrapper::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;background-color:#0000;background-image:repeating-linear-gradient(45deg,var(--grid-color) 0 1px,transparent 2px 5px);opacity:0;z-index:-1}
          .btn-wrapper:has(.btn:hover)::after{animation:opacity-anim calc(var(--animation-speed) * 4) ease-in-out forwards}
          @keyframes opacity-anim{80%{opacity:0}100%{opacity:1}}
          .btn-wrapper .btn{position:relative;display:flex;justify-content:center;align-items:center;padding:.8rem 1.25rem;background-color:#fff0;border:1px solid var(--grid-color);color:#fffd;font-family:"Inter",sans-serif;letter-spacing:-.01em;font-size:1rem;font-weight:600;text-transform:capitalize;border-radius:6px;cursor:pointer;transition:transform .2s ease-in-out,letter-spacing .2s ease-in-out}
          .btn-wrapper .btn:hover{background-color:#25358b;color:#fff;transform:scale(1.05);letter-spacing:.06em}
          .btn-wrapper .btn:active{background-color:#25358b;transform:scale(.98);letter-spacing:.02em}
          .btn-wrapper .btn-svg{margin-left:.5rem;height:24px;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke:#fff4;fill:#fff2;transition:all .2s ease-in-out}
          .btn-wrapper .btn:hover .btn-svg{stroke:#fffa;fill:#fff3}
          .btn-wrapper .dot{position:absolute;width:var(--dot-size);aspect-ratio:1;border-radius:2px;background-color:var(--dot-color);transition:all .3s ease-in-out;opacity:0}
          .btn-wrapper:has(.btn:hover) .dot.top.left{top:50%;left:20%;animation:move-top-left var(--animation-speed) ease-in-out forwards}
          @keyframes move-top-left{90%{opacity:.6}100%{top:calc(var(--dot-size)*-.5);left:calc(var(--dot-size)*-.5);opacity:1}}
          .btn-wrapper:has(.btn:hover) .dot.top.right{top:50%;right:20%;animation:move-top-right var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*.6)}
          @keyframes move-top-right{80%{opacity:.6}100%{top:calc(var(--dot-size)*-.5);right:calc(var(--dot-size)*-.5);opacity:1}}
          .btn-wrapper:has(.btn:hover) .dot.bottom.right{bottom:50%;right:20%;animation:move-bottom-right var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*1.2)}
          @keyframes move-bottom-right{80%{opacity:.6}100%{bottom:calc(var(--dot-size)*-.5);right:calc(var(--dot-size)*-.5);opacity:1}}
          .btn-wrapper:has(.btn:hover) .dot.bottom.left{bottom:50%;left:20%;animation:move-bottom-left var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*1.8)}
          @keyframes move-bottom-left{80%{opacity:.6}100%{bottom:calc(var(--dot-size)*-.5);left:calc(var(--dot-size)*-.5);opacity:1}}
          .btn-wrapper .line{position:absolute;transition:all .3s ease-in-out}
          .btn-wrapper .line.horizontal{height:var(--line-weight);width:100%;background-image:repeating-linear-gradient(90deg,#0000 0 calc(var(--line-weight)*2),var(--line-color) calc(var(--line-weight)*2) calc(var(--line-weight)*4))}
          .btn-wrapper .line.top{top:calc(var(--line-weight)*-.5);transform-origin:top left;transform:rotate(5deg) scaleX(0)}
          .btn-wrapper:has(.btn:hover) .line.top{animation:draw-top var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*.8)}
          @keyframes draw-top{100%{transform:rotate(0deg) scaleX(1)}}
          .btn-wrapper .line.bottom{bottom:calc(var(--line-weight)*-.5);transform-origin:bottom right;transform:rotate(5deg) scaleX(0)}
          .btn-wrapper:has(.btn:hover) .line.bottom{animation:draw-bottom var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*2)}
          @keyframes draw-bottom{100%{transform:rotate(0deg) scaleX(1)}}
          .btn-wrapper .line.vertical{width:var(--line-weight);height:100%;background-image:repeating-linear-gradient(0deg,#0000 0 calc(var(--line-weight)*2),var(--line-color) calc(var(--line-weight)*2) calc(var(--line-weight)*4))}
          .btn-wrapper .line.left{left:calc(var(--line-weight)*-.5);transform-origin:bottom left;transform:rotate(0deg) scaleY(0)}
          .btn-wrapper:has(.btn:hover) .line.left{animation:draw-left var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*2.4)}
          @keyframes draw-left{100%{transform:rotate(0deg) scaleY(1)}}
          .btn-wrapper .line.right{right:calc(var(--line-weight)*-.5);transform-origin:top right;transform:rotate(5deg) scaleY(0)}
          .btn-wrapper:has(.btn:hover) .line.right{animation:draw-right var(--animation-speed) ease-in-out forwards;animation-delay:calc(var(--animation-speed)*1.4)}
          @keyframes draw-right{100%{transform:rotate(0deg) scaleY(1)}}
        </style>
        <div class="line horizontal top"></div>
        <div class="line vertical right"></div>
        <div class="line horizontal bottom"></div>
        <div class="line vertical left"></div>
        <div class="dot top left"></div>
        <div class="dot top right"></div>
        <div class="dot bottom right"></div>
        <div class="dot bottom left"></div>
        <button class="btn bg-[#ffffff]">
          <span class="btn-text">${label}</span>
          <svg class="btn-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.6744 11.4075L15.7691 17.1233C15.7072 17.309 15.5586 17.4529 15.3709 17.5087L3.69348 20.9803C3.22819 21.1186 2.79978 20.676 2.95328 20.2155L6.74467 8.84131C6.79981 8.67588 6.92419 8.54263 7.08543 8.47624L12.472 6.25822C12.696 6.166 12.9535 6.21749 13.1248 6.38876L17.5294 10.7935C17.6901 10.9542 17.7463 11.1919 17.6744 11.4075Z"></path>
            <path d="M3.2959 20.6016L9.65986 14.2376"></path>
            <path d="M17.7917 11.0557L20.6202 8.22724C21.4012 7.44619 21.4012 6.17986 20.6202 5.39881L18.4989 3.27749C17.7178 2.49645 16.4515 2.49645 15.6704 3.27749L12.842 6.10592"></path>
            <path d="M11.7814 12.1163C11.1956 11.5305 10.2458 11.5305 9.66004 12.1163C9.07426 12.7021 9.07426 13.6519 9.66004 14.2376C10.2458 14.8234 11.1956 14.8234 11.7814 14.2376C12.3671 13.6519 12.3671 12.7021 11.7814 12.1163Z"></path>
          </svg>
        </button>
      </a>
    </div>
  </div>
</body>
</html>`;

const definition: EffectDefinition = {
  title: "Dot Border button",
  source: "",
  background: "#111318",
  theme: { lightBackground: "#f4f7fb", darkBackground: "#111318" },
  targets: [{ selector: ".component-wrapper .btn-wrapper", role: "button", preserveTransform: true }],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function effectBackground(def: EffectDefinition, mode: EffectMode) {
  return def.theme?.[`${mode}Background`] ?? def.background;
}

function buildFocusedDocument(def: EffectDefinition, mode: EffectMode, label: string) {
  const background = effectBackground(def, mode);
  const targetJson = JSON.stringify(def.targets).replace(/</g, "\\u003c");
  const modeJson = JSON.stringify(mode);
  const focusStyle = `<style data-threeui-focus>
html,body{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:${background}!important;color-scheme:${mode}!important}
body{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important}
body > *{visibility:hidden!important}
body[data-threeui-ready] > [data-threeui-role]{visibility:visible!important}
[data-threeui-residual]{display:none!important}
[data-threeui-role="button"]{position:relative!important;z-index:2!important;opacity:1!important;flex:none!important}
[data-threeui-role="button"]:not([data-threeui-preserve-transform]){transform:none!important}
</style>`;
  const focusScript = `<script data-threeui-focus>(function(){document.documentElement.dataset.sfMode=${modeJson};var isolated=false;function isolate(){if(isolated)return;var specs=${targetJson};var roots=[];specs.forEach(function(spec){var el=document.querySelector(spec.selector);if(!el)return;el.setAttribute('data-threeui-role',spec.role);if(spec.preserveTransform)el.setAttribute('data-threeui-preserve-transform','');if(!roots.some(function(r){return r.contains(el)}))roots.push(el)});if(!roots.length)return;isolated=true;roots.forEach(function(root){var link=root.matches('a[href="#"]')?root:root.querySelector('a[href="#"]');if(link)link.addEventListener('click',function(e){e.preventDefault()});document.body.appendChild(root)});Array.from(document.body.children).forEach(function(el){if(roots.indexOf(el)!==-1)return;el.setAttribute('data-threeui-residual','');el.setAttribute('aria-hidden','true');if('inert' in el)el.inert=true});document.body.setAttribute('data-threeui-ready','');requestAnimationFrame(function(){window.dispatchEvent(new Event('resize'))})}function schedule(){setTimeout(isolate,100)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();window.addEventListener('load',isolate,{once:true})})();</script>`;
  return buildSource(label)
    .replace(/<\/head>/i, `${focusStyle}</head>`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

function DotBorderButton({
  mode = DOT_BORDER_BUTTON_DEFAULTS.mode,
  hue = DOT_BORDER_BUTTON_DEFAULTS.hue,
  saturation = DOT_BORDER_BUTTON_DEFAULTS.saturation,
  brightness = DOT_BORDER_BUTTON_DEFAULTS.brightness,
  className,
  style,
  label = "Start Creating",
}: DotBorderButtonProps) {
  const safeMode: EffectMode = mode === "light" ? "light" : "dark";
  const background = effectBackground(definition, safeMode);
  const source = useMemo(() => buildFocusedDocument(definition, safeMode, label), [safeMode, label]);
  const safeHue = clamp(hue, -180, 180);
  const safeSat = clamp(saturation, 0, 2);
  const safeBri = clamp(brightness, 0.35, 1.65);
  const filter =
    safeHue === 0 && safeSat === 1 && safeBri === 1
      ? undefined
      : `hue-rotate(${safeHue}deg) saturate(${safeSat}) brightness(${safeBri})`;
  return (
    <iframe
      className={className}
      data-mode={safeMode}
      title={definition.title}
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{ display: "block", width: "100%", height: "100%", border: 0, background, filter, ...style }}
    />
  );
}

export default DotBorderButton;
