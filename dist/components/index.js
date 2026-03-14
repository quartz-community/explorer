import { jsxs, jsx } from 'preact/jsx-runtime';

// src/components/OverflowList.tsx
var OverflowList = ({
  children,
  ...props
}) => {
  return /* @__PURE__ */ jsxs("ul", { ...props, class: [props.class, "overflow"].filter(Boolean).join(" "), id: props.id, children: [
    children,
    /* @__PURE__ */ jsx("li", { class: "overflow-end" })
  ] });
};
var numLists = 0;
var OverflowList_default = () => {
  const id = `list-${numLists++}`;
  return {
    OverflowList: (props) => /* @__PURE__ */ jsx(OverflowList, { ...props, id }),
    overflowListAfterDOMLoaded: `
document.addEventListener("nav", (e) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const parentUl = entry.target.parentElement
      if (!parentUl) return
      if (entry.isIntersecting) {
        parentUl.classList.remove("gradient-active")
      } else {
        parentUl.classList.add("gradient-active")
      }
    }
  })

  const ul = document.getElementById("${id}")
  if (!ul) return

  const end = ul.querySelector(".overflow-end")
  if (!end) return

  observer.observe(end)
  window.addCleanup(() => observer.disconnect())
})
`
  };
};

// src/util/lang.ts
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    explorer: {
      title: "Explorer"
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// src/components/styles/explorer.scss
var explorer_default = "@media all and (max-width: 800px) {\n  .page > #quartz-body > :not(.sidebar.left:has(.explorer)) {\n    transition: transform 300ms ease-in-out;\n  }\n  .page > #quartz-body.lock-scroll > :not(.sidebar.left:has(.explorer)) {\n    transform: translateX(100dvw);\n    transition: transform 300ms ease-in-out;\n  }\n  .page > #quartz-body .sidebar.left:has(.explorer) {\n    box-sizing: border-box;\n    position: sticky;\n    background-color: var(--light);\n    padding: 1rem 0 1rem 0;\n    margin: 0;\n  }\n  .page > #quartz-body .hide-until-loaded ~ .explorer-content {\n    display: none;\n  }\n}\n.explorer {\n  display: flex;\n  flex-direction: column;\n  overflow-y: hidden;\n  min-height: 1.2rem;\n  flex: 0 1 auto;\n}\n\n.explorer.collapsed {\n  flex: 0 1 1.2rem;\n}\n\n.explorer.collapsed .fold {\n  transform: rotateZ(-90deg);\n}\n\n.explorer .fold {\n  margin-left: 0.5rem;\n  transition: transform 0.3s ease;\n  opacity: 0.8;\n}\n\n@media all and (max-width: 800px) {\n  .explorer {\n    order: -1;\n    height: initial;\n    overflow: hidden;\n    flex-shrink: 0;\n    align-self: flex-start;\n    margin-top: auto;\n    margin-bottom: auto;\n  }\n}\n.explorer button.mobile-explorer {\n  display: none;\n}\n\n.explorer button.desktop-explorer {\n  display: flex;\n}\n\n@media all and (max-width: 800px) {\n  .explorer button.mobile-explorer {\n    display: flex;\n  }\n  .explorer button.desktop-explorer {\n    display: none;\n  }\n}\n.explorer svg {\n  pointer-events: all;\n  transition: transform 0.35s ease;\n}\n\n.explorer svg > polyline {\n  pointer-events: none;\n}\n\nbutton.mobile-explorer,\nbutton.desktop-explorer {\n  background-color: transparent;\n  border: none;\n  text-align: left;\n  cursor: pointer;\n  padding: 0;\n  color: var(--dark);\n  display: flex;\n  align-items: center;\n}\n\nbutton.mobile-explorer h2,\nbutton.desktop-explorer h2 {\n  font-size: 1rem;\n  display: inline-block;\n  margin: 0;\n}\n\n.explorer-content {\n  list-style: none;\n  overflow: hidden;\n  overflow-y: auto;\n  margin-top: 0.5rem;\n}\n\n.explorer-content ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n.explorer-content ul.explorer-ul {\n  overscroll-behavior: contain;\n}\n\n.explorer-content ul li > a {\n  color: var(--dark);\n  opacity: 0.75;\n  pointer-events: all;\n}\n\n.explorer-content ul li > a.active {\n  opacity: 1;\n  color: var(--tertiary);\n}\n\n.explorer-content .folder-outer {\n  visibility: collapse;\n  display: grid;\n  grid-template-rows: 0fr;\n  transition-property: grid-template-rows, visibility;\n  transition-duration: 0.3s;\n  transition-timing-function: ease-in-out;\n}\n\n.explorer-content .folder-outer.open {\n  visibility: visible;\n  grid-template-rows: 1fr;\n}\n\n.explorer-content .folder-outer > ul {\n  overflow: hidden;\n  margin-left: 6px;\n  padding-left: 0.8rem;\n  border-left: 1px solid var(--lightgray);\n}\n\n.folder-container {\n  flex-direction: row;\n  display: flex;\n  align-items: center;\n  user-select: none;\n}\n\n.folder-container div > a {\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 600;\n  line-height: 1.5rem;\n  display: inline-block;\n}\n\n.folder-container div > a:hover {\n  color: var(--tertiary);\n}\n\n.folder-container div > button {\n  color: var(--dark);\n  background-color: transparent;\n  border: none;\n  text-align: left;\n  cursor: pointer;\n  padding-left: 0;\n  padding-right: 0;\n  display: flex;\n  align-items: center;\n  font-family: var(--headerFont);\n}\n\n.folder-container div > button span {\n  font-size: 0.95rem;\n  display: inline-block;\n  color: var(--secondary);\n  font-weight: 600;\n  margin: 0;\n  line-height: 1.5rem;\n  pointer-events: none;\n}\n\n.folder-icon {\n  margin-right: 5px;\n  color: var(--secondary);\n  cursor: pointer;\n  transition: transform 0.3s ease;\n  backface-visibility: visible;\n  flex-shrink: 0;\n}\n\nli:has(> .folder-outer:not(.open)) > .folder-container > svg {\n  transform: rotate(-90deg);\n}\n\n.folder-icon:hover {\n  color: var(--tertiary);\n}\n\n@media all and (max-width: 800px) {\n  .explorer.collapsed {\n    flex: 0 0 34px;\n  }\n  .explorer.collapsed > .explorer-content {\n    transform: translateX(-100vw);\n    visibility: hidden;\n  }\n  .explorer:not(.collapsed) {\n    flex: 0 0 34px;\n  }\n  .explorer:not(.collapsed) > .explorer-content {\n    transform: translateX(0);\n    visibility: visible;\n  }\n  .explorer .explorer-content {\n    box-sizing: border-box;\n    z-index: 100;\n    position: absolute;\n    top: 0;\n    left: 0;\n    margin-top: 0;\n    background-color: var(--light);\n    max-width: 100vw;\n    width: 100vw;\n    transform: translateX(-100vw);\n    transition: transform 200ms ease, visibility 200ms ease;\n    overflow: hidden;\n    padding: 4rem 0 2rem 0;\n    height: 100dvh;\n    max-height: 100dvh;\n    visibility: hidden;\n  }\n  .explorer .mobile-explorer {\n    margin: 0;\n    padding: 5px;\n    z-index: 101;\n  }\n  .explorer .mobile-explorer.hide-until-loaded {\n    display: none;\n  }\n  .explorer .mobile-explorer .lucide-menu {\n    stroke: var(--darkgray);\n  }\n}\n@media all and (max-width: 800px) {\n  .mobile-no-scroll .explorer-content > .explorer-ul {\n    overscroll-behavior: contain;\n  }\n}";

// src/components/scripts/explorer.inline.ts
var explorer_inline_default = `var Tu=Object.hasOwnProperty;var X,A,Y,_u,S,G,uu,eu,tu,$,H,M,fu,O={},nu=[],du=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,j=Array.isArray;function y(u,e){for(var t in e)u[t]=e[t];return u}function J(u){u&&u.parentNode&&u.parentNode.removeChild(u)}function R(u,e,t,o,l){var r={type:u,props:e,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:l??++Y,__i:-1,__u:0};return l==null&&A.vnode!=null&&A.vnode(r),r}function L(u){return u.children}function N(u,e){this.props=u,this.context=e}function w(u,e){if(e==null)return u.__?w(u.__,u.__i+1):null;for(var t;e<u.__k.length;e++)if((t=u.__k[e])!=null&&t.__e!=null)return t.__e;return typeof u.type=="function"?w(u):null}function ru(u){var e,t;if((u=u.__)!=null&&u.__c!=null){for(u.__e=u.__c.base=null,e=0;e<u.__k.length;e++)if((t=u.__k[e])!=null&&t.__e!=null){u.__e=u.__c.base=t.__e;break}return ru(u)}}function K(u){(!u.__d&&(u.__d=!0)&&S.push(u)&&!W.__r++||G!=A.debounceRendering)&&((G=A.debounceRendering)||uu)(W)}function W(){for(var u,e,t,o,l,r,i,s=1;S.length;)S.length>s&&S.sort(eu),u=S.shift(),s=S.length,u.__d&&(t=void 0,o=void 0,l=(o=(e=u).__v).__e,r=[],i=[],e.__P&&((t=y({},o)).__v=o.__v+1,A.vnode&&A.vnode(t),Du(e.__P,t,o,e.__n,e.__P.namespaceURI,32&o.__u?[l]:null,r,l??w(o),!!(32&o.__u),i),t.__v=o.__v,t.__.__k[t.__i]=t,Cu(r,t,i),o.__e=o.__=null,t.__e!=l&&ru(t)));W.__r=0}function ou(u,e,t,o,l,r,i,s,d,D,c){var n,p,F,_,E,C,a,f=o&&o.__k||nu,h=e.length;for(d=pu(t,e,f,d,h),n=0;n<h;n++)(F=t.__k[n])!=null&&(p=F.__i==-1?O:f[F.__i]||O,F.__i=n,C=Du(u,F,p,l,r,i,s,d,D,c),_=F.__e,F.ref&&p.ref!=F.ref&&(p.ref&&z(p.ref,null,F),c.push(F.ref,F.__c||_,F)),E==null&&_!=null&&(E=_),(a=!!(4&F.__u))||p.__k===F.__k?d=lu(F,d,u,a):typeof F.type=="function"&&C!==void 0?d=C:_&&(d=_.nextSibling),F.__u&=-7);return t.__e=E,d}function pu(u,e,t,o,l){var r,i,s,d,D,c=t.length,n=c,p=0;for(u.__k=new Array(l),r=0;r<l;r++)(i=e[r])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=u.__k[r]=R(null,i,null,null,null):j(i)?i=u.__k[r]=R(L,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=u.__k[r]=R(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):u.__k[r]=i,d=r+p,i.__=u,i.__b=u.__b+1,s=null,(D=i.__i=Eu(i,t,d,n))!=-1&&(n--,(s=t[D])&&(s.__u|=2)),s==null||s.__v==null?(D==-1&&(l>c?p--:l<c&&p++),typeof i.type!="function"&&(i.__u|=4)):D!=d&&(D==d-1?p--:D==d+1?p++:(D>d?p--:p++,i.__u|=4))):u.__k[r]=null;if(n)for(r=0;r<c;r++)(s=t[r])!=null&&(2&s.__u)==0&&(s.__e==o&&(o=w(s)),su(s,s));return o}function lu(u,e,t,o){var l,r;if(typeof u.type=="function"){for(l=u.__k,r=0;l&&r<l.length;r++)l[r]&&(l[r].__=u,e=lu(l[r],e,t,o));return e}u.__e!=e&&(o&&(e&&u.type&&!e.parentNode&&(e=w(u)),t.insertBefore(u.__e,e||null)),e=u.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Eu(u,e,t,o){var l,r,i,s=u.key,d=u.type,D=e[t],c=D!=null&&(2&D.__u)==0;if(D===null&&s==null||c&&s==D.key&&d==D.type)return t;if(o>(c?1:0)){for(l=t-1,r=t+1;l>=0||r<e.length;)if((D=e[i=l>=0?l--:r++])!=null&&(2&D.__u)==0&&s==D.key&&d==D.type)return i}return-1}function Z(u,e,t){e[0]=="-"?u.setProperty(e,t??""):u[e]=t==null?"":typeof t!="number"||du.test(e)?t:t+"px"}function P(u,e,t,o,l){var r,i;u:if(e=="style")if(typeof t=="string")u.style.cssText=t;else{if(typeof o=="string"&&(u.style.cssText=o=""),o)for(e in o)t&&e in t||Z(u.style,e,"");if(t)for(e in t)o&&t[e]==o[e]||Z(u.style,e,t[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(tu,"$1")),i=e.toLowerCase(),e=i in u||e=="onFocusOut"||e=="onFocusIn"?i.slice(2):e.slice(2),u.l||(u.l={}),u.l[e+r]=t,t?o?t.u=o.u:(t.u=$,u.addEventListener(e,r?M:H,r)):u.removeEventListener(e,r?M:H,r);else{if(l=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in u)try{u[e]=t??"";break u}catch{}typeof t=="function"||(t==null||t===!1&&e[4]!="-"?u.removeAttribute(e):u.setAttribute(e,e=="popover"&&t==1?"":t))}}function Q(u){return function(e){if(this.l){var t=this.l[e.type+u];if(e.t==null)e.t=$++;else if(e.t<t.u)return;return t(A.event?A.event(e):e)}}}function Du(u,e,t,o,l,r,i,s,d,D){var c,n,p,F,_,E,C,a,f,h,g,B,m,x,b,T,U,v=e.type;if(e.constructor!==void 0)return null;128&t.__u&&(d=!!(32&t.__u),r=[s=e.__e=t.__e]),(c=A.__b)&&c(e);u:if(typeof v=="function")try{if(a=e.props,f="prototype"in v&&v.prototype.render,h=(c=v.contextType)&&o[c.__c],g=c?h?h.props.value:c.__:o,t.__c?C=(n=e.__c=t.__c).__=n.__E:(f?e.__c=n=new v(a,g):(e.__c=n=new N(a,g),n.constructor=v,n.render=Au),h&&h.sub(n),n.state||(n.state={}),n.__n=o,p=n.__d=!0,n.__h=[],n._sb=[]),f&&n.__s==null&&(n.__s=n.state),f&&v.getDerivedStateFromProps!=null&&(n.__s==n.state&&(n.__s=y({},n.__s)),y(n.__s,v.getDerivedStateFromProps(a,n.__s))),F=n.props,_=n.state,n.__v=e,p)f&&v.getDerivedStateFromProps==null&&n.componentWillMount!=null&&n.componentWillMount(),f&&n.componentDidMount!=null&&n.__h.push(n.componentDidMount);else{if(f&&v.getDerivedStateFromProps==null&&a!==F&&n.componentWillReceiveProps!=null&&n.componentWillReceiveProps(a,g),e.__v==t.__v||!n.__e&&n.shouldComponentUpdate!=null&&n.shouldComponentUpdate(a,n.__s,g)===!1){for(e.__v!=t.__v&&(n.props=a,n.state=n.__s,n.__d=!1),e.__e=t.__e,e.__k=t.__k,e.__k.some(function(k){k&&(k.__=e)}),B=0;B<n._sb.length;B++)n.__h.push(n._sb[B]);n._sb=[],n.__h.length&&i.push(n);break u}n.componentWillUpdate!=null&&n.componentWillUpdate(a,n.__s,g),f&&n.componentDidUpdate!=null&&n.__h.push(function(){n.componentDidUpdate(F,_,E)})}if(n.context=g,n.props=a,n.__P=u,n.__e=!1,m=A.__r,x=0,f){for(n.state=n.__s,n.__d=!1,m&&m(e),c=n.render(n.props,n.state,n.context),b=0;b<n._sb.length;b++)n.__h.push(n._sb[b]);n._sb=[]}else do n.__d=!1,m&&m(e),c=n.render(n.props,n.state,n.context),n.state=n.__s;while(n.__d&&++x<25);n.state=n.__s,n.getChildContext!=null&&(o=y(y({},o),n.getChildContext())),f&&!p&&n.getSnapshotBeforeUpdate!=null&&(E=n.getSnapshotBeforeUpdate(F,_)),T=c,c!=null&&c.type===L&&c.key==null&&(T=iu(c.props.children)),s=ou(u,j(T)?T:[T],e,t,o,l,r,i,s,d,D),n.base=e.__e,e.__u&=-161,n.__h.length&&i.push(n),C&&(n.__E=n.__=null)}catch(k){if(e.__v=null,d||r!=null)if(k.then){for(e.__u|=d?160:128;s&&s.nodeType==8&&s.nextSibling;)s=s.nextSibling;r[r.indexOf(s)]=null,e.__e=s}else{for(U=r.length;U--;)J(r[U]);q(e)}else e.__e=t.__e,e.__k=t.__k,k.then||q(e);A.__e(k,e,t)}else r==null&&e.__v==t.__v?(e.__k=t.__k,e.__e=t.__e):s=e.__e=hu(t.__e,e,t,o,l,r,i,d,D);return(c=A.diffed)&&c(e),128&e.__u?void 0:s}function q(u){u&&u.__c&&(u.__c.__e=!0),u&&u.__k&&u.__k.forEach(q)}function Cu(u,e,t){for(var o=0;o<t.length;o++)z(t[o],t[++o],t[++o]);A.__c&&A.__c(e,u),u.some(function(l){try{u=l.__h,l.__h=[],u.some(function(r){r.call(l)})}catch(r){A.__e(r,l.__v)}})}function iu(u){return typeof u!="object"||u==null||u.__b&&u.__b>0?u:j(u)?u.map(iu):y({},u)}function hu(u,e,t,o,l,r,i,s,d){var D,c,n,p,F,_,E,C=t.props||O,a=e.props,f=e.type;if(f=="svg"?l="http://www.w3.org/2000/svg":f=="math"?l="http://www.w3.org/1998/Math/MathML":l||(l="http://www.w3.org/1999/xhtml"),r!=null){for(D=0;D<r.length;D++)if((F=r[D])&&"setAttribute"in F==!!f&&(f?F.localName==f:F.nodeType==3)){u=F,r[D]=null;break}}if(u==null){if(f==null)return document.createTextNode(a);u=document.createElementNS(l,f,a.is&&a),s&&(A.__m&&A.__m(e,r),s=!1),r=null}if(f==null)C===a||s&&u.data==a||(u.data=a);else{if(r=r&&X.call(u.childNodes),!s&&r!=null)for(C={},D=0;D<u.attributes.length;D++)C[(F=u.attributes[D]).name]=F.value;for(D in C)if(F=C[D],D!="children"){if(D=="dangerouslySetInnerHTML")n=F;else if(!(D in a)){if(D=="value"&&"defaultValue"in a||D=="checked"&&"defaultChecked"in a)continue;P(u,D,null,F,l)}}for(D in a)F=a[D],D=="children"?p=F:D=="dangerouslySetInnerHTML"?c=F:D=="value"?_=F:D=="checked"?E=F:s&&typeof F!="function"||C[D]===F||P(u,D,F,C[D],l);if(c)s||n&&(c.__html==n.__html||c.__html==u.innerHTML)||(u.innerHTML=c.__html),e.__k=[];else if(n&&(u.innerHTML=""),ou(e.type=="template"?u.content:u,j(p)?p:[p],e,t,o,f=="foreignObject"?"http://www.w3.org/1999/xhtml":l,r,i,r?r[0]:t.__k&&w(t,0),s,d),r!=null)for(D=r.length;D--;)J(r[D]);s||(D="value",f=="progress"&&_==null?u.removeAttribute("value"):_!=null&&(_!==u[D]||f=="progress"&&!_||f=="option"&&_!=C[D])&&P(u,D,_,C[D],l),D="checked",E!=null&&E!=u[D]&&P(u,D,E,C[D],l))}return u}function z(u,e,t){try{if(typeof u=="function"){var o=typeof u.__u=="function";o&&u.__u(),o&&e==null||(u.__u=u(e))}else u.current=e}catch(l){A.__e(l,t)}}function su(u,e,t){var o,l;if(A.unmount&&A.unmount(u),(o=u.ref)&&(o.current&&o.current!=u.__e||z(o,null,e)),(o=u.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){A.__e(r,e)}o.base=o.__P=null}if(o=u.__k)for(l=0;l<o.length;l++)o[l]&&su(o[l],e,t||typeof u.type!="function");t||J(u.__e),u.__c=u.__=u.__e=void 0}function Au(u,e,t){return this.constructor(u,t)}X=nu.slice,A={__e:function(u,e,t,o){for(var l,r,i;e=e.__;)if((l=e.__c)&&!l.__)try{if((r=l.constructor)&&r.getDerivedStateFromError!=null&&(l.setState(r.getDerivedStateFromError(u)),i=l.__d),l.componentDidCatch!=null&&(l.componentDidCatch(u,o||{}),i=l.__d),i)return l.__E=l}catch(s){u=s}throw u}},Y=0,_u=function(u){return u!=null&&u.constructor===void 0},N.prototype.setState=function(u,e){var t;t=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=y({},this.state),typeof u=="function"&&(u=u(y({},t),this.props)),u&&y(t,u),u!=null&&this.__v&&(e&&this._sb.push(e),K(this))},N.prototype.forceUpdate=function(u){this.__v&&(this.__e=!0,u&&this.__h.push(u),K(this))},N.prototype.render=L,S=[],uu=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,eu=function(u,e){return u.__v.__b-e.__v.__b},W.__r=0,tu=/(PointerCapture)$|Capture$/i,$=0,H=Q(!1),M=Q(!0),fu=0;function I(u){let e=vu(Bu(u,"index"),!0);return e.length===0?"/":e}function mu(u,e){return u===e||u.endsWith("/"+e)}function Bu(u,e){return mu(u,e)&&(u=u.slice(0,-e.length)),u}function vu(u,e){return u.startsWith("/")&&(u=u.substring(1)),!e&&u.endsWith("/")&&(u=u.slice(0,-1)),u}var V=class u{constructor(e,t){this.children=[],this.slugSegments=e,this.data=t||null,this.isFolder=!1,this.fileSegmentHint=null}get displayName(){return(this.data?.title==="index"?void 0:this.data?.title)||this.fileSegmentHint||this.slugSegment||""}get slug(){let e=this.slugSegments.join("/");return this.isFolder?e+"/index":e}get slugSegment(){return this.slugSegments[this.slugSegments.length-1]||""}makeChild(e,t){let o=[...this.slugSegments,e[0]],l=new u(o,t);return this.children.push(l),l}insert(e,t){if(e.length===0)return;this.isFolder=!0;let o=e[0];if(e.length===1)o==="index"?this.data||(this.data=t):this.makeChild(e,t);else{let l=this.children.find(i=>i.slugSegment===o);l||(l=this.makeChild(e,void 0));let r=(t.filePath||t.slug||"").split("/");l.fileSegmentHint=r[r.length-e.length],l.insert(e.slice(1),t)}}add(e){this.insert(e.slug.split("/"),e)}sort(e){this.children.sort(e),this.children.forEach(t=>t.sort(e))}filter(e){this.children=this.children.filter(e),this.children.forEach(t=>t.filter(e))}map(e){e(this),this.children.forEach(t=>t.map(e))}static fromEntries(e){let t=new u([],null);return e.forEach(([,o])=>t.add(o)),t}},yu=(u,e)=>!u.isFolder&&!e.isFolder||u.isFolder&&e.isFolder?u.displayName.localeCompare(e.displayName,void 0,{numeric:!0,sensitivity:"base"}):!u.isFolder&&e.isFolder?1:-1,xu=u=>u.slugSegment!=="tags";function Su(u,e,t,o){return t&&u.filter(t),o&&u.map(o),e&&u.sort(e),u}async function bu(u){try{console.log("[Explorer] Fetching content index...");let t=await(await fetch("/static/contentIndex.json")).json();if(console.log("[Explorer] Fetched data keys:",Object.keys(t).slice(0,5)),!t)return console.error("[Explorer] No data received"),null;let o=t.content||t,l=Object.entries(o);if(console.log("[Explorer] Entry count:",l.length),l.length===0)return console.warn("[Explorer] No content entries found"),null;let r=V.fromEntries(l);console.log("[Explorer] Trie root children:",r.children.length);let i=yu,s=xu,d=null;if(u)try{let D=JSON.parse(u);D.sortFn&&(i=new Function("a","b","return ("+D.sortFn+")(a, b)")),D.filterFn&&(s=new Function("node","return ("+D.filterFn+")(node)")),D.mapFn&&(d=new Function("node","("+D.mapFn+")(node)"))}catch(D){console.error("Error parsing data functions:",D)}return Su(r,i,s,d)}catch(e){return console.error("Error building file trie:",e),null}}var Fu=0;function cu(u,e,t,o,l,r=""){let i=document.getElementById("template-folder"),s=document.getElementById("template-file");if(!i||!s)return;let d=r?r+"/"+u.slugSegment:u.slugSegment,D=I(t);if(u.isFolder){let c=i.content.cloneNode(!0),n=c.querySelector(".folder-container"),p=c.querySelector(".folder-button"),F=c.querySelector(".folder-title"),_=c.querySelector(".folder-outer"),E=c.querySelector(".content");if(F&&(F.textContent=u.displayName||u.slugSegment),n&&(n.dataset.folderpath=u.slug),o==="link"&&p){let h=document.createElement("a");h.className=p.className;let g=I(u.slug);h.href="/"+(g||""),F?h.appendChild(F):h.textContent=u.displayName||u.slugSegment,p.replaceWith(h),p=h}let C=l[u.slug]!==void 0?l[u.slug]:!0,a=I(u.slug),f=a&&a===D.slice(0,a.length);if((!C||f)&&_&&_.classList.add("open"),u.children&&u.children.length>0&&E)for(let h of u.children)cu(h,E,t,o,l,d);e.appendChild(c)}else if(u.data){let c=s.content.cloneNode(!0),n=c.querySelector("a");n&&(n.href="/"+u.data.slug,n.textContent=u.displayName||u.slugSegment,u.data.slug===t&&n.classList.add("active")),e.appendChild(c)}}async function au(u){let e=++Fu;try{console.log("[Explorer] Nav event received, generation:",e);let t=(u.detail?.url||"").replace(/^\\/+/,""),o=document.querySelectorAll("div.explorer");console.log("[Explorer] Found",o.length,"explorers");let l={};try{JSON.parse(localStorage.getItem("fileTree")||"[]").forEach(i=>{l[i.path]=i.collapsed})}catch(r){console.error("[Explorer] Error loading saved state:",r)}for(let r of o){let i=r.querySelector(".explorer-ul");if(!i){console.warn("[Explorer] No explorer-ul found");continue}i.innerHTML='<li class="overflow-end"></li>';let s=r.dataset.dataFns,d=r.dataset.behavior||"collapse";console.log("[Explorer] Starting tree build...");let D=await bu(s);if(e===Fu){if(console.log("[Explorer] Render generation is current, rendering tree"),console.log("[Explorer] Trie result:",D?"success":"null"),D&&D.children&&D.children.length>0){i.innerHTML='<li class="overflow-end"></li>',console.log("[Explorer] Rendering",D.children.length,"children");for(let E of D.children)cu(E,i,t,d,l,"");console.log("[Explorer] Render complete, final list length:",i.children.length)}else console.warn("[Explorer] No trie or empty children");let _=sessionStorage.getItem("explorerScrollTop");if(_)i.scrollTop=parseInt(_,10);else{let E=i.querySelector(".active");E&&E.scrollIntoView({behavior:"smooth"})}}else console.log("[Explorer] Stale render generation, skipping tree render");let c=[],n=r.getElementsByClassName("explorer-toggle");for(let _ of n){let E=function(){let C=this.closest(".explorer");if(!C)return;let a=C.classList.toggle("collapsed");C.setAttribute("aria-expanded",a?"false":"true"),a?document.documentElement.classList.remove("mobile-no-scroll"):document.documentElement.classList.add("mobile-no-scroll")};_.addEventListener("click",E),c.push(()=>_.removeEventListener("click",E))}let p=r.getElementsByClassName("folder-icon");for(let _ of p){let E=function(C){C.stopPropagation();let a=this.parentElement;if(!a)return;let f=a.nextElementSibling;if(!f)return;f.classList.toggle("open");let h=!f.classList.contains("open"),g=a.dataset.folderpath,B=JSON.parse(localStorage.getItem("fileTree")||"[]"),m=B.findIndex(x=>x.path===g);m>=0?B[m].collapsed=h:B.push({path:g,collapsed:h}),localStorage.setItem("fileTree",JSON.stringify(B))};_.addEventListener("click",E),c.push(()=>_.removeEventListener("click",E))}let F=r.getElementsByClassName("folder-button");for(let _ of F){let E=function(C){let a=this.closest(".folder-container");if(!a)return;let f=r.dataset.behavior||"collapse",h=a.nextElementSibling,g=a.dataset.folderpath;if(f!=="link"){if(C.stopPropagation(),!h)return;h.classList.toggle("open");let B=!h.classList.contains("open"),m=JSON.parse(localStorage.getItem("fileTree")||"[]"),x=m.findIndex(b=>b.path===g);x>=0?m[x].collapsed=B:m.push({path:g,collapsed:B}),localStorage.setItem("fileTree",JSON.stringify(m))}};_.addEventListener("click",E),c.push(()=>_.removeEventListener("click",E))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>c.forEach(_=>_()))}for(let r of document.getElementsByClassName("explorer")){let i=r.querySelector(".mobile-explorer");i&&(i.classList.remove("hide-until-loaded"),i.checkVisibility&&i.checkVisibility()&&(r.classList.add("collapsed"),r.setAttribute("aria-expanded","false"),document.documentElement.classList.remove("mobile-no-scroll")))}}catch(t){console.error("[Explorer] Fatal error in nav handler:",t)}}document.addEventListener("nav",au);document.addEventListener("render",au);document.addEventListener("prenav",()=>{let u=document.querySelector(".explorer-ul");u&&sessionStorage.setItem("explorerScrollTop",u.scrollTop.toString())});
`;
var defaultOptions = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
  mapFn: (node) => {
    return node;
  },
  sortFn: (a, b) => {
    if (!a.isFolder && !b.isFolder || a.isFolder && b.isFolder) {
      return (a.displayName || "").localeCompare(b.displayName || "", void 0, {
        numeric: true,
        sensitivity: "base"
      });
    }
    if (!a.isFolder && b.isFolder) {
      return 1;
    }
    return -1;
  },
  filterFn: (node) => node.slugSegment !== "tags",
  order: ["filter", "map", "sort"]
};
var numExplorers = 0;
function concatenateResources(...resources) {
  return resources.filter((r) => !!r).join("\n");
}
var Explorer_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const { OverflowList: OverflowList2, overflowListAfterDOMLoaded } = OverflowList_default();
  const ExplorerComponent = (props) => {
    const { cfg } = props;
    const displayClass = props.displayClass;
    const id = `explorer-${numExplorers++}`;
    const locale = cfg?.locale ?? "en-US";
    const title = opts.title ?? i18n(locale).components.explorer.title;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        class: classNames(displayClass, "explorer"),
        "data-behavior": opts.folderClickBehavior,
        "data-collapsed": opts.folderDefaultState,
        "data-savestate": opts.useSavedState,
        "data-data-fns": JSON.stringify({
          order: opts.order,
          sortFn: opts.sortFn?.toString(),
          filterFn: opts.filterFn?.toString(),
          mapFn: opts.mapFn?.toString()
        }),
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              class: "explorer-toggle mobile-explorer hide-until-loaded",
              "data-mobile": true,
              "aria-controls": id,
              children: /* @__PURE__ */ jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "24",
                  height: "24",
                  viewBox: "0 0 24 24",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  class: "lucide-menu",
                  children: [
                    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "12", y2: "12" }),
                    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "6", y2: "6" }),
                    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "18", y2: "18" })
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              class: "title-button explorer-toggle desktop-explorer",
              "data-mobile": false,
              "aria-expanded": true,
              children: [
                /* @__PURE__ */ jsx("h2", { children: title }),
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "14",
                    height: "14",
                    viewBox: "5 8 14 8",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    class: "fold",
                    children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { id, class: "explorer-content", "aria-expanded": false, role: "group", children: /* @__PURE__ */ jsx(OverflowList2, { class: "explorer-ul" }) }),
          /* @__PURE__ */ jsx("template", { id: "template-file", children: /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#" }) }) }),
          /* @__PURE__ */ jsx("template", { id: "template-folder", children: /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("div", { class: "folder-container", children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "12",
                  height: "12",
                  viewBox: "5 8 14 8",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  class: "folder-icon",
                  children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
                }
              ),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", { class: "folder-button", children: /* @__PURE__ */ jsx("span", { class: "folder-title" }) }) })
            ] }),
            /* @__PURE__ */ jsx("div", { class: "folder-outer", children: /* @__PURE__ */ jsx("ul", { class: "content" }) })
          ] }) })
        ]
      }
    );
  };
  ExplorerComponent.css = explorer_default;
  ExplorerComponent.afterDOMLoaded = concatenateResources(explorer_inline_default, overflowListAfterDOMLoaded);
  return ExplorerComponent;
});

export { Explorer_default as Explorer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map