function e(e,t,i,s){var o,a=arguments.length,n=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(n=(a<3?o(n):a>3?o(t,i,n):o(t,i))||n);return a>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const n=e=>new a("string"==typeof e?e:e+"",void 0,s),r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new a(i,e,s)},l=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return n(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:p,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:g}=Object,v=globalThis,f=v.trustedTypes,m=f?f.emptyScript:"",b=v.reactiveElementPolyfillSupport,y=(e,t)=>e,x={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!c(e,t),_={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&d(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const a=s?.call(this);o?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...h(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:x).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:x;this._$Em=s;const a=o.fromAttribute(t,e.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){if(void 0!==e){const a=this.constructor;if(!1===s&&(o=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??w)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==o||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[y("elementProperties")]=new Map,k[y("finalized")]=new Map,b?.({ReactiveElement:k}),(v.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,S=e=>e,C=A.trustedTypes,$=C?C.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+T,M=`<${I}>`,D=document,O=()=>D.createComment(""),z=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,R="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,F=/>/g,N=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,H=/"/g,U=/^(?:script|style|textarea|title)$/i,W=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),q=W(1),G=W(2),V=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),K=new WeakMap,X=D.createTreeWalker(D,129);function Q(e,t){if(!P(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==$?$.createHTML(t):t}class Z{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,a=0;const n=e.length-1,r=this.parts,[l,c]=((e,t)=>{const i=e.length-1,s=[];let o,a=2===t?"<svg>":3===t?"<math>":"",n=B;for(let t=0;t<i;t++){const i=e[t];let r,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===B?"!--"===l[1]?n=L:void 0!==l[1]?n=F:void 0!==l[2]?(U.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=N):void 0!==l[3]&&(n=N):n===N?">"===l[0]?(n=o??B,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,r=l[1],n=void 0===l[3]?N:'"'===l[3]?H:j):n===H||n===j?n=N:n===L||n===F?n=B:(n=N,o=void 0);const p=n===N&&e[t+1].startsWith("/>")?" ":"";a+=n===B?i+M:c>=0?(s.push(r),i.slice(0,c)+E+i.slice(c)+T+p):i+T+(-2===c?t:p)}return[Q(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=Z.createElement(l,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=X.nextNode())&&r.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(E)){const t=c[a++],i=s.getAttribute(e).split(T),n=/([.?@])?(.*)/.exec(t);r.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?se:"?"===n[1]?oe:"@"===n[1]?ae:ie}),s.removeAttribute(e)}else e.startsWith(T)&&(r.push({type:6,index:o}),s.removeAttribute(e));if(U.test(s.tagName)){const e=s.textContent.split(T),t=e.length-1;if(t>0){s.textContent=C?C.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],O()),X.nextNode(),r.push({type:2,index:++o});s.append(e[t],O())}}}else if(8===s.nodeType)if(s.data===I)r.push({type:2,index:o});else{let e=-1;for(;-1!==(e=s.data.indexOf(T,e+1));)r.push({type:7,index:o}),e+=T.length-1}o++}}static createElement(e,t){const i=D.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===V)return t;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const a=z(t)?void 0:t._$litDirective$;return o?.constructor!==a&&(o?._$AO?.(!1),void 0===a?o=void 0:(o=new a(e),o._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(t=J(e,o._$AS(e,t.values),o,s)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??D).importNode(t,!0);X.currentNode=s;let o=X.nextNode(),a=0,n=0,r=i[0];for(;void 0!==r;){if(a===r.index){let t;2===r.type?t=new te(o,o.nextSibling,this,e):1===r.type?t=new r.ctor(o,r.name,r.strings,this,e):6===r.type&&(t=new ne(o,this,e)),this._$AV.push(t),r=i[++n]}a!==r?.index&&(o=X.nextNode(),a++)}return X.currentNode=D,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),z(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>P(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Y&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(D.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ee(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new Z(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new te(this.O(O()),this.O(O()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}_$AI(e,t=this,i,s){const o=this.strings;let a=!1;if(void 0===o)e=J(this,e,t,0),a=!z(e)||e!==this._$AH&&e!==V,a&&(this._$AH=e);else{const s=e;let n,r;for(e=o[0],n=0;n<o.length-1;n++)r=J(this,s[i+n],t,n),r===V&&(r=this._$AH[n]),a||=!z(r)||r!==this._$AH[n],r===Y?e=Y:e!==Y&&(e+=(r??"")+o[n+1]),this._$AH[n]=r}a&&!s&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}class oe extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Y)}}class ae extends ie{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??Y)===V)return;const i=this._$AH,s=e===Y&&i!==Y||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==Y&&(i===Y||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re={I:te},le=A.litHtmlPolyfillSupport;le?.(Z,te),(A.litHtmlVersions??=[]).push("3.3.2");const ce=globalThis;let de=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let o=s._$litPart$;if(void 0===o){const e=i?.renderBefore??null;s._$litPart$=o=new te(t.insertBefore(O(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};de._$litElement$=!0,de.finalized=!0,ce.litElementHydrateSupport?.({LitElement:de});const pe=ce.litElementPolyfillSupport;pe?.({LitElement:de}),(ce.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ue={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:w},ge=(e=ue,t,i)=>{const{kind:s,metadata:o}=i;let a=globalThis.litPropertyMetadata.get(o);if(void 0===a&&globalThis.litPropertyMetadata.set(o,a=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,o,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];t.call(this,i),this.requestUpdate(s,o,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ve(e){return(t,i)=>"object"==typeof i?ge(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return ve({...e,state:!0,attribute:!1})}const me=1,be=2,ye=e=>(...t)=>({_$litDirective$:e,values:t});let xe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const we="important",_e=" !"+we,ke=ye(class extends xe{constructor(e){if(super(e),e.type!==me||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const s=e[i];return null==s?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const s=t[e];if(null!=s){this.ft.add(e);const t="string"==typeof s&&s.endsWith(_e);e.includes("-")||t?i.setProperty(e,t?s.slice(0,-11):s,t?we:""):i[e]=s}}return V}}),{I:Ae}=re,Se=e=>e,Ce=()=>document.createComment(""),$e=(e,t,i)=>{const s=e._$AA.parentNode,o=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(Ce(),o),a=s.insertBefore(Ce(),o);i=new Ae(t,a,e,e.options)}else{const t=i._$AB.nextSibling,a=i._$AM,n=a!==e;if(n){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==a._$AU&&i._$AP(t)}if(t!==o||n){let e=i._$AA;for(;e!==t;){const t=Se(e).nextSibling;Se(s).insertBefore(e,o),e=t}}}return i},Ee=(e,t,i=e)=>(e._$AI(t,i),e),Te={},Ie=(e,t=Te)=>e._$AH=t,Me=e=>{e._$AR(),e._$AA.remove()},De=(e,t,i)=>{const s=new Map;for(let o=t;o<=i;o++)s.set(e[o],o);return s},Oe=ye(class extends xe{constructor(e){if(super(e),e.type!==be)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const o=[],a=[];let n=0;for(const t of e)o[n]=s?s(t,n):n,a[n]=i(t,n),n++;return{values:a,keys:o}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const o=(e=>e._$AH)(e),{values:a,keys:n}=this.dt(t,i,s);if(!Array.isArray(o))return this.ut=n,a;const r=this.ut??=[],l=[];let c,d,p=0,h=o.length-1,u=0,g=a.length-1;for(;p<=h&&u<=g;)if(null===o[p])p++;else if(null===o[h])h--;else if(r[p]===n[u])l[u]=Ee(o[p],a[u]),p++,u++;else if(r[h]===n[g])l[g]=Ee(o[h],a[g]),h--,g--;else if(r[p]===n[g])l[g]=Ee(o[p],a[g]),$e(e,l[g+1],o[p]),p++,g--;else if(r[h]===n[u])l[u]=Ee(o[h],a[u]),$e(e,o[p],o[h]),h--,u++;else if(void 0===c&&(c=De(n,u,g),d=De(r,p,h)),c.has(r[p]))if(c.has(r[h])){const t=d.get(n[u]),i=void 0!==t?o[t]:null;if(null===i){const t=$e(e,o[p]);Ee(t,a[u]),l[u]=t}else l[u]=Ee(i,a[u]),$e(e,o[p],i),o[t]=null;u++}else Me(o[h]),h--;else Me(o[p]),p++;for(;u<=g;){const t=$e(e,l[g+1]);Ee(t,a[u]),l[u++]=t}for(;p<=h;){const e=o[p++];null!==e&&Me(e)}return this.ut=n,Ie(e,l),V}});var ze,Pe;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ze||(ze={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Pe||(Pe={}));var Re=function(e,t,i,s){s=s||{},i=null==i?{}:i;var o=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return o.detail=i,e.dispatchEvent(o),o};const Be=[{label:"Default",value:void 0,group:"System"},{label:"Inter",value:"Inter, sans-serif",group:"System"},{label:"Roboto",value:"Roboto, sans-serif",group:"System"},{label:"Mono",value:"'IBM Plex Mono', monospace",group:"System"},{label:"System UI",value:"system-ui, sans-serif",group:"System"},{label:"Abril Fatface",value:"'Abril Fatface', cursive",group:"Bundled"},{label:"Bangers",value:"'Bangers', cursive",group:"Bundled"},{label:"Graduate",value:"'Graduate', cursive",group:"Bundled"},{label:"Limelight",value:"'Limelight', cursive",group:"Bundled"},{label:"Lobster",value:"'Lobster', cursive",group:"Bundled"},{label:"Pacifico",value:"'Pacifico', cursive",group:"Bundled"},{label:"Righteous",value:"'Righteous', cursive",group:"Bundled"},{label:"Special Elite",value:"'Special Elite', cursive",group:"Bundled"},{label:"Alfa Slab One",value:"'Alfa Slab One', cursive",group:"Display",cdn:"Alfa+Slab+One"},{label:"Bebas Neue",value:"'Bebas Neue', sans-serif",group:"Display",cdn:"Bebas+Neue"},{label:"Black Ops One",value:"'Black Ops One', cursive",group:"Display",cdn:"Black+Ops+One"},{label:"Bungee",value:"'Bungee', cursive",group:"Display",cdn:"Bungee"},{label:"Bungee Shade",value:"'Bungee Shade', cursive",group:"Display",cdn:"Bungee+Shade"},{label:"Cinzel",value:"'Cinzel', serif",group:"Display",cdn:"Cinzel"},{label:"Dancing Script",value:"'Dancing Script', cursive",group:"Display",cdn:"Dancing+Script"},{label:"Fredericka the Great",value:"'Fredericka the Great', cursive",group:"Display",cdn:"Fredericka+the+Great"},{label:"Great Vibes",value:"'Great Vibes', cursive",group:"Display",cdn:"Great+Vibes"},{label:"Monoton",value:"'Monoton', cursive",group:"Display",cdn:"Monoton"},{label:"Permanent Marker",value:"'Permanent Marker', cursive",group:"Display",cdn:"Permanent+Marker"},{label:"Shrikhand",value:"'Shrikhand', cursive",group:"Display",cdn:"Shrikhand"},{label:"Ultra",value:"'Ultra', serif",group:"Display",cdn:"Ultra"}],Le=Be.map(e=>e.cdn).filter(e=>!!e);function Fe(){return Le.length?`https://fonts.googleapis.com/css2?${Le.map(e=>`family=${e}`).join("&")}&display=swap`:""}const Ne=["_config","_closedAreas","_graphData","_periodEnergy","_periodEnergyErrAt","_valveDragPos","_trvDragTemp","_detailDevice","_detailHistoryRange","_activeViewId","_cloudDetailOpen","_areaChipOpen","preview"];const je={warm_dusk:{accent_color:"#c98a63",card_bg:"#1e1a17",tile_bg:"rgba(255,244,232,0.035)",tile_border:"rgba(255,244,232,0.08)",tile_hover_bg:"rgba(255,244,232,0.06)",tile_hover_shadow:"rgba(0,0,0,0.35)",tile_sensor_bg:"rgba(255,244,232,0.045)",tile_exp_bg:"rgba(255,244,232,0.05)",text_primary:"#ece5dc",text_secondary:"#b3a596",text_muted:"#7e7265",header_bg:"#241f1b",header_bg2:"#33291f",header_text_color:"#f3ece3",header_orb_color:"#c98a63",online_color:"#93b384",offline_color:"#d47f62",power_color:"#dba25c",area_header_color:"#c98a63"},dark_industrial:{accent_color:"#f4601e",card_bg:"#1c1c1e",tile_bg:"rgba(255,255,255,0.04)",tile_border:"rgba(255,255,255,0.07)",tile_hover_bg:"rgba(255,255,255,0.07)",tile_hover_shadow:"rgba(0,0,0,0.30)",tile_sensor_bg:"rgba(255,255,255,0.04)",tile_exp_bg:"rgba(255,255,255,0.06)",text_primary:"#e5e7eb",text_secondary:"#9ca3af",text_muted:"#6b7280",header_bg:"#1a1a2e",header_bg2:"#0f3460",header_text_color:"#ffffff",header_orb_color:"#3b82f6",online_color:"#4ade80",offline_color:"#ef4444",power_color:"#fb923c",area_header_color:"#f4601e"},shelly_blue:{accent_color:"#3ea1f5",card_bg:"#12161f",tile_bg:"#1a212e",tile_border:"#263247",tile_hover_bg:"rgba(62,161,245,0.08)",tile_hover_shadow:"rgba(0,0,0,0.40)",tile_sensor_bg:"rgba(62,161,245,0.06)",tile_exp_bg:"rgba(62,161,245,0.08)",text_primary:"#e9eef6",text_secondary:"#a9b7cd",text_muted:"#6b7a91",header_bg:"#151b28",header_bg2:"#1e2c47",header_text_color:"#eef3fa",header_orb_color:"#3ea1f5",online_color:"#39c86e",offline_color:"#ef5350",power_color:"#f5a623",area_header_color:"#3ea1f5"},teal_terminal:{accent_color:"#2dd4bf",card_bg:"#0b0f0e",tile_bg:"#0f1917",tile_border:"#1e2b28",tile_hover_bg:"rgba(45,212,191,0.08)",tile_hover_shadow:"rgba(0,0,0,0.40)",tile_sensor_bg:"rgba(45,212,191,0.05)",tile_exp_bg:"rgba(45,212,191,0.07)",text_primary:"#d1fae5",text_secondary:"#6ee7b7",text_muted:"#4b5563",header_bg:"#042f2e",header_bg2:"#0b6157",header_text_color:"#ccfbf1",header_orb_color:"#2dd4bf",online_color:"#34d399",offline_color:"#f87171",power_color:"#fbbf24",area_header_color:"#2dd4bf"},brutalist:{accent_color:"#facc15",card_bg:"#000000",tile_bg:"#0a0a0a",tile_border:"#ffffff",tile_hover_bg:"rgba(255,255,255,0.12)",tile_hover_shadow:"rgba(250,204,21,0.25)",tile_sensor_bg:"rgba(255,255,255,0.06)",tile_exp_bg:"rgba(255,255,255,0.09)",text_primary:"#ffffff",text_secondary:"#d4d4d4",text_muted:"#a3a3a3",header_bg:"#000000",header_bg2:"#171717",header_text_color:"#facc15",header_orb_color:"#facc15",online_color:"#22c55e",offline_color:"#ef4444",power_color:"#facc15",area_header_color:"#ffffff"},frosted_light:{accent_color:"#0071e3",card_bg:"#f2f2f7",tile_bg:"#ffffff",tile_border:"#d1d1d6",tile_hover_bg:"rgba(0,0,0,0.04)",tile_hover_shadow:"rgba(0,0,0,0.12)",tile_sensor_bg:"rgba(0,0,0,0.04)",tile_exp_bg:"rgba(0,0,0,0.05)",text_primary:"#1c1c1e",text_secondary:"#48484a",text_muted:"#8e8e93",header_bg:"#e8eef7",header_bg2:"#cfe0f5",header_text_color:"#1c1c1e",header_orb_color:"#0071e3",online_color:"#34c759",offline_color:"#ff3b30",power_color:"#ff9500",area_header_color:"#0071e3"},nordic_warm:{accent_color:"#d08770",card_bg:"#2e3440",tile_bg:"#3b4252",tile_border:"#434c5e",tile_hover_bg:"rgba(236,239,244,0.06)",tile_hover_shadow:"rgba(0,0,0,0.30)",tile_sensor_bg:"rgba(236,239,244,0.04)",tile_exp_bg:"rgba(236,239,244,0.06)",text_primary:"#eceff4",text_secondary:"#d8dee9",text_muted:"#9aa4b8",header_bg:"#3b4252",header_bg2:"#434c5e",header_text_color:"#eceff4",header_orb_color:"#ebcb8b",online_color:"#a3be8c",offline_color:"#bf616a",power_color:"#d08770",area_header_color:"#d08770"},midnight_purple:{accent_color:"#a78bfa",card_bg:"#0f0a1e",tile_bg:"#1a1030",tile_border:"#2e1f4d",tile_hover_bg:"rgba(167,139,250,0.10)",tile_hover_shadow:"rgba(0,0,0,0.45)",tile_sensor_bg:"rgba(167,139,250,0.06)",tile_exp_bg:"rgba(167,139,250,0.08)",text_primary:"#ede9fe",text_secondary:"#c4b5fd",text_muted:"#7c6ba8",header_bg:"#1e1b4b",header_bg2:"#4c1d95",header_text_color:"#ede9fe",header_orb_color:"#a78bfa",online_color:"#4ade80",offline_color:"#fb7185",power_color:"#c084fc",area_header_color:"#a78bfa"}},He=["warm_dusk","shelly_blue","dark_industrial","teal_terminal","brutalist","frosted_light","nordic_warm","midnight_purple"],Ue={ha:"Follow HA",warm_dusk:"Warm Dusk",shelly_blue:"Shelly Blue",dark_industrial:"Dark Industrial",teal_terminal:"Teal Terminal",brutalist:"Brutalist",frosted_light:"Frosted Light",nordic_warm:"Nordic Warm",midnight_purple:"Midnight Purple",custom:"Custom"},We={accent_color:"var(--primary-color, #03a9f4)",card_bg:"var(--primary-background-color, #fafafa)",tile_bg:"var(--ha-card-background, var(--card-background-color, #fff))",tile_border:"var(--divider-color, rgba(0,0,0,0.12))",tile_hover_bg:"var(--secondary-background-color, rgba(0,0,0,0.04))",tile_hover_shadow:"rgba(0,0,0,0.25)",tile_sensor_bg:"var(--secondary-background-color, rgba(0,0,0,0.04))",tile_exp_bg:"var(--secondary-background-color, rgba(0,0,0,0.04))",text_primary:"var(--primary-text-color, #212121)",text_secondary:"var(--secondary-text-color, #727272)",text_muted:"var(--disabled-text-color, #bdbdbd)",header_bg:"var(--app-header-background-color, var(--primary-color, #03a9f4))",header_bg2:"var(--app-header-background-color, var(--primary-color, #03a9f4))",header_text_color:"var(--app-header-text-color, var(--text-primary-color, #fff))",header_orb_color:"var(--accent-color, #ff9800)",online_color:"var(--success-color, #4caf50)",offline_color:"var(--error-color, #f44336)",power_color:"var(--warning-color, #ff9800)",area_header_color:"var(--primary-text-color, #212121)"};function qe(e){if(e&&"custom"!==e)return"ha"===e?We:je[e]}const Ge=Object.keys(je.dark_industrial);function Ve(e){const t=e??{};if(0===Object.keys(t).length)return"warm_dusk";for(const e of He){const i=je[e];let s=!0;for(const e of Object.keys(i))if(t[e]!==i[e]){s=!1;break}if(s)return e}return"custom"}const Ye=r`
    .xc-match {
      --ha-card-background:      var(--sc-tile-bg);
      --card-background-color:   var(--sc-tile-bg);
      --ha-card-border-radius:   var(--tile-radius);
      --ha-card-border-color:    var(--sc-tile-border);
      --ha-card-border-width:    var(--sc-tile-border-width);
      --ha-card-box-shadow:      var(--sc-tile-shadow);
      --primary-text-color:      var(--sc-text-primary);
      --secondary-text-color:    var(--sc-text-secondary);
      --disabled-text-color:     var(--sc-text-muted);
      --divider-color:           var(--sc-tile-border);
      --primary-color:           var(--sc-accent);
      --accent-color:            var(--sc-accent);
      --state-icon-color:        var(--sc-accent);
      --state-active-color:      var(--sc-accent);
      --paper-item-icon-color:   var(--sc-text-secondary);
      --ha-card-header-color:    var(--sc-text-primary);
      --mdc-theme-primary:       var(--sc-accent);
      font-family: var(--sc-font-family, inherit);
    }
`,Ke=r`
:host {
      /* Fill the container width. Without this the element is display:inline and
         collapses to its content width — fine inside a grid cell that constrains
         it, but in the card-editor preview pane (no width constraint) it left a
         black gap to the right. */
      display: block;
      --sc-accent:          #c98a63;
      --sc-accent-glow:     rgba(201,138,99,0.30);
      --sc-graph-line:      var(--sc-accent);
      --tile-radius:        12px;
      --tile-gap:           10px;
      --sc-header-bg:       linear-gradient(135deg,#241f1b 0%,#33291f 100%);
      --sc-header-orb2:     #c98a63;
      --sc-header-text:     #f3ece3;
      --sc-online-color:    #93b384;
      --sc-online-bg:       rgba(147,179,132,0.18);
      --sc-online-border:   rgba(147,179,132,0.28);
      --sc-online-glow:     rgba(147,179,132,0.35);
      --sc-power-color:     #dba25c;
      --sc-offline-dot:     #d47f62;
      --sc-tile-bg:         rgba(255,244,232,0.035);
      --sc-tile-bg-image:   none;
      --sc-tile-bg-image-sz:cover;
      --sc-tile-border:     rgba(255,244,232,0.08);
      --sc-tile-hover-bg:   rgba(255,244,232,0.06);
      --sc-tile-hover-shad: rgba(0,0,0,0.35);
      --sc-tile-exp-bg:     rgba(255,244,232,0.05);
      --sc-sensor-bg:       rgba(255,244,232,0.045);
      --sc-text-primary:    #ece5dc;
      --sc-text-secondary:  #b3a596;
      --sc-text-muted:      #7e7265;
      --sc-text-value:      #f5efe7;
      /* Derived from the themed text tiers, not a fixed beige: a constant read
         as light-on-white under the Follow-HA light theme (the V/A strip). */
      --sc-text-detail:     color-mix(in srgb, var(--sc-text-primary) 70%, var(--sc-text-secondary));
      --sc-tog-off-bg:      rgba(255,255,255,0.08);
      --sc-tog-off-border:  rgba(255,255,255,0.10);
      --sc-update-color:    #f59e0b;
      --sc-update-glow:     rgba(245,158,11,0.40);
      --sc-font-family:     var(--ha-font-family-body, var(--mdc-typography-font-family, Roboto, system-ui, sans-serif));
      --sc-text-transform:  uppercase;
      --sc-text-scale:      1;
      /* Type scale — every tile font size derives from these four steps */
      --fs-xs: calc(var(--sc-text-scale, 1) * 0.72em);
      --fs-sm: calc(var(--sc-text-scale, 1) * 0.82em);
      --fs-md: calc(var(--sc-text-scale, 1) * 0.95em);
      --fs-lg: calc(var(--sc-text-scale, 1) * 1.2em);
      --sc-card-bg:         var(--ha-card-background, var(--card-background-color, #1e1a17));
      --sc-card-bg-image:   none;
      --sc-card-bg-image-sz:cover;
      --sc-tile-bg-opacity:      1;
      --sc-header-opacity:       1;
      --sc-header-orb-opacity:   0.5;
      --sc-header-radius:        0px;
      --sc-header-padding:       16px;
      --sc-header-title-size:    1.1em;
      --sc-header-icon:          '⚡';
      --sc-header-border-width:  0px;
      --sc-header-border-color:  transparent;
      --sc-tile-border-width:    1px;
      --sc-tile-shadow:          none;
      --sc-card-radius:          var(--ha-card-border-radius, 12px);
      --sc-area-header-color:    var(--sc-accent);
      --sc-hover-bg:             rgba(255,255,255,0.12);
      --sc-focus-ring:           var(--sc-accent);
    }


    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
      border-radius: var(--sc-card-radius);
    }


    /* Unified keyboard-focus ring for every interactive element inside the card */
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    [role="button"]:focus-visible {
      outline: 2px solid var(--sc-focus-ring);
      outline-offset: 2px;
    }


    /* flex-wrap matters more than it looks: .dash-stats is flex-shrink:0 with
       nowrap chips, and this row is overflow:hidden for the blurred orbs. With a
       long header_chips list (11 is a real config) the stats row alone exceeds the
       card, and anything after it — the collapse button, the cloud chips — was
       silently clipped off the right edge rather than pushed to a second line. */
    .dash-header {
      position: relative; display: flex; align-items: center; gap:10px;
      flex-wrap: wrap; row-gap: 8px;
      padding: var(--sc-header-padding, 16px) 18px; overflow: hidden;
      border-radius: var(--sc-header-radius, 0px);
      border-bottom: var(--sc-header-border-width, 0px) solid var(--sc-header-border-color, transparent);
    }

    .dash-header-bg {
      position: absolute; inset: 0; background: var(--sc-header-bg);
      opacity: var(--sc-header-opacity, 1); pointer-events: none; z-index: 0;
    }

    .dash-stats { margin-right: auto; }

    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px);
      opacity: var(--sc-header-orb-opacity, 0.5);
      animation: drift 8s ease-in-out infinite alternate;
    }

    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }

    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }

    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    @media (prefers-reduced-motion: reduce) {
      .dash-header::before, .dash-header::after { animation: none; }
    }


    .dash-title {
      font-size: var(--sc-header-title-size, 1.1em); font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }

    .dash-title::before { content: var(--sc-header-icon, '⚡'); }


    /* Wraps for the same reason: 11 nowrap chips are wider than the card in a
       sections-view column, and flex-shrink:0 means they cannot give any of it
       back. Without this the chips past the edge are simply not rendered to the
       user, with nothing to indicate they were dropped. */
    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; flex-shrink:0; flex-wrap:wrap; }

    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }

    .stat:hover { opacity:.8; }

    .stat.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }

    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }

    .stat.metric   { background:rgba(255,255,255,.07); color:var(--sc-text-secondary); border:1px solid rgba(255,255,255,.12); }

    .stat.updates-count { background:rgba(245,158,11,.18); color:var(--sc-update-color); border:1px solid rgba(245,158,11,.3); }

    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }

    .stat.offline-count { background:rgba(75,85,99,.25); color:var(--sc-text-secondary); border:1px solid rgba(75,85,99,.35); }

    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }

    /* Scoped header stat chip color overrides */
    .dash-header .stat.online       { color:var(--sc-hstat-online, var(--sc-online-color)); background:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 18%,transparent); border-color:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 30%,transparent); }

    .dash-header .stat.power        { color:var(--sc-hstat-power, var(--sc-power-color)); }

    .dash-header .stat.offline-count { color:var(--sc-hstat-offline, #9ca3af); }


    /* ── Cloud status chips ── */
    /* Collapse/expand every room. Sits in the body directly above the first room
       rather than in the card header: it acts on the rooms, so it belongs next to
       them, and the header is the one row on the card that is already contested.
       Right-aligned to the room blocks' own edge — the 10px matches
       .area-section's horizontal margin so the two line up. */
    .rooms-toolbar { display:flex; justify-content:flex-end; margin:2px 10px 0; }
    .collapse-all {
      display:inline-flex; align-items:center; gap:5px;
      font-family:inherit; font-size:0.72em; font-weight:700;
      padding:3px 10px; border-radius:20px; cursor:pointer;
      color:var(--sc-text-secondary, #9ca3af);
      background:var(--sc-tile-bg, rgba(255,255,255,0.04));
      border:1px solid var(--sc-tile-border, rgba(255,255,255,0.08));
      transition:all .15s;
    }
    .collapse-all:hover { color:var(--sc-text-primary, #e5e7eb); border-color:var(--sc-accent); }
    .collapse-all:focus-visible { outline:2px solid var(--sc-accent); outline-offset:2px; }
    .ca-chev { font-size:.85em; line-height:1; display:inline-block; transition:transform .25s; }
    .ca-chev.open { transform:rotate(180deg); }

    .cloud-chips { display:flex; gap:5px; align-items:center; position:relative; z-index:1; flex-shrink:0; }

    .cloud-chip { font-size:0.72em; font-weight:700; padding:3px 10px; border-radius:20px; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }

    .cloud-chip:hover { opacity:.8; }

    .cloud-chip.cloud-on    { background:rgba(74,222,128,.18); color:var(--sc-online-color); border:1px solid rgba(74,222,128,.3); }

    .cloud-chip.cloud-off   { background:rgba(239,68,68,.18);  color:#f87171; border:1px solid rgba(239,68,68,.3); }

    .cloud-chip.cloud-unavail { background:rgba(107,114,128,.2); color:var(--sc-text-secondary); border:1px solid rgba(107,114,128,.3); }

    .cloud-chip.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }


    /* ── Cloud detail panel ── */
    .cloud-detail { padding:12px 18px 14px; background:rgba(0,0,0,.3); border-bottom:1px solid rgba(255,255,255,.06); animation:slide-in .15s ease; }

    .cloud-detail-hdr { font-size:.7em; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,.08); }

    .cloud-detail-hdr.cloud-on    { color:var(--sc-online-color); }

    .cloud-detail-hdr.cloud-off   { color:#f87171; }

    .cloud-detail-hdr.cloud-unavail { color:var(--sc-text-secondary); }

    .cloud-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:4px 16px; }

    .cloud-item { font-size:.82em; color:var(--sc-text-secondary); padding:3px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* Header chip drill-down: devices ranked high→low by the chip's metric */
    .metric-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:2px 20px; }

    .metric-row { display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:3px 0; min-width:0; border-bottom:1px solid rgba(255,255,255,.04); }

    .metric-name { font-size:.82em; color:var(--sc-text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }

    .metric-val { font-size:.82em; font-weight:600; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; flex-shrink:0; }


    /* ── View tabs ──────────────────────────────── */
    .view-tabs {
      display: flex; gap: 4px; padding: 8px 12px 4px; overflow-x: auto;
      border-bottom: 1px solid var(--sc-tile-border);
      scrollbar-width: thin;
    }
    .view-tab {
      flex-shrink: 0; display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 18px;
      background: rgba(255, 255, 255, .04); border: 1px solid transparent;
      color: var(--sc-text-secondary); font-size: .85em; font-weight: 600;
      cursor: pointer; transition: all .15s;
      font-family: inherit;
    }
    .view-tab:hover { background: rgba(255, 255, 255, .08); color: var(--sc-text-primary); }
    .view-tab.active {
      background: color-mix(in srgb, var(--sc-accent) 16%, transparent);
      border-color: color-mix(in srgb, var(--sc-accent) 32%, transparent);
      color: var(--sc-accent);
    }
    .view-tab-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; }

    .dash-body { padding:0 0 8px; }

    .empty { padding:32px; text-align:center; color:var(--secondary-text-color); }

    .empty .hint { font-size:.85em; margin-top:4px; }


    .area-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }
    /* Room backdrop photo (AreaStyle.bg_image). A ::before layer sits behind the
       header + tile grid; semi-transparent tiles let it show through. */
    .area-section[style*="--area-bg-image"]::before {
      content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
      background:var(--area-bg-image) var(--area-bg-pos, center) / var(--area-bg-image-sz, cover) no-repeat;
    }
    /* Ambient mode: blur + darken so the photo reads as mood behind the tiles.
       inset:-28px pushes the soft blurred edges outside the section, which
       overflow:hidden then clips — otherwise the blur feathers to transparent. */
    .area-section.area-bg-ambient::before {
      inset:-28px; filter:blur(16px) brightness(0.5) saturate(1.15);
    }
    .area-section > * { position:relative; z-index:1; }

    /* Frosted-glass tiles over a room photo. Each tile blurs the photo behind it
       into a legible translucent panel, so the photo stays crisp in the gaps but
       the data never sits on a busy image. This is what makes a room backdrop
       look intentional rather than cluttered. */
    .area-section[style*="--area-bg-image"] .device-grid { gap:calc(var(--tile-gap,10px) + 2px); }
    .area-section[style*="--area-bg-image"] .tile {
      backdrop-filter: blur(20px) saturate(1.35);
      -webkit-backdrop-filter: blur(20px) saturate(1.35);
      border-color: rgba(255,255,255,0.16);
      /* drop shadow to lift the panel + a 1px inner top highlight for a glass edge */
      box-shadow: 0 3px 16px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14);
    }
    .area-section[style*="--area-bg-image"] .tile::after {
      background: rgba(15,17,23,0.52);
      background-image: none;          /* the room photo lives on the section, not each tile */
      opacity: 1;                      /* the glass scrim owns its own alpha */
    }
    /* …but a per-device tile photo (device_styles[id].bg_image) is more specific
       than the room layer, so it still shows — under its own scrim so text stays
       readable over the section photo. */
    .area-section[style*="--area-bg-image"] .tile[style*="--sc-tile-bg-image"]::after {
      background-image: linear-gradient(rgba(15,17,23,0.68), rgba(15,17,23,0.68)), var(--sc-tile-bg-image);
      background-size: cover, var(--sc-tile-bg-image-sz);
      background-position: center, right center;
      background-repeat: no-repeat;
    }
    /* A soft dark gradient across the bottom of the photo grounds the tiles and
       lifts white text — applied to sharp mode (ambient is already darkened). */
    .area-section[style*="--area-bg-image"]:not(.area-bg-ambient)::before {
      box-shadow: inset 0 -80px 90px -40px rgba(0,0,0,0.55), inset 0 0 0 1000px rgba(0,0,0,0.12);
    }

    .area-header {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--area-header-bg,rgba(255,255,255,0.04));
      padding:8px 14px; cursor:pointer; user-select:none;
      border-radius:10px; transition:filter 0.15s;
    }

    .area-header:hover { filter:brightness(1.08); }

    .area-section:not(.closed) .area-header { border-radius:10px 10px 0 0; border-bottom:1px solid var(--sc-tile-border); }

    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); font-style:var(--area-name-style,normal); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-area-header-color,var(--sc-accent))); }

    .area-chips { display:flex; align-items:center; flex-wrap:wrap; gap:4px; flex:1; margin:0 10px; }

    .area-chip { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:1px 5px; cursor:pointer; transition:border-color .12s,background .12s; }
    .area-chip:hover { border-color:var(--sc-accent); }
    .area-chip.active { border-color:var(--sc-accent); background:var(--sc-accent-glow,rgba(244,96,30,0.14)); }

    .area-chip .tsc-lbl { font-size:var(--fs-xs); color:var(--secondary-text-color); }

    .area-chip .tsc-val { font-size:.72em; font-weight:600; color:var(--sc-text-primary,var(--primary-text-color)); }

    .area-meta { display:flex; align-items:center; gap:8px; }

    .area-chip-detail { margin:2px 0 10px; padding:8px 12px; background:var(--sc-tile-exp-bg,rgba(255,255,255,0.05)); border:1px solid var(--sc-tile-border,rgba(255,255,255,0.08)); border-radius:8px; }
    .acd-hdr { font-size:.68em; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--sc-text-muted,var(--secondary-text-color)); margin-bottom:6px; }
    .acd-list { display:flex; flex-direction:column; gap:2px; }
    .acd-row { display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:.82em; padding:2px 0; }
    .acd-name { color:var(--sc-text-secondary,var(--secondary-text-color)); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .acd-val { font-weight:600; color:var(--sc-text-primary,var(--primary-text-color)); font-variant-numeric:tabular-nums; flex-shrink:0; }

    .area-count { font-size:.75em; color:var(--secondary-text-color); }


    .chevron { font-size:.6em; color:var(--secondary-text-color); transition:transform 0.25s; display:inline-block; }

    .chevron.open { transform:rotate(180deg); }


    .device-grid {
      display:grid; grid-template-columns:repeat(var(--cols,3),1fr);
      gap:var(--tile-gap,10px); padding:4px 12px 14px;
    }

    @container ha-dash (max-width:600px) { .device-grid { --cols:2; } }

    @container ha-dash (max-width:380px) { .device-grid { --cols:1; } }

    @container ha-dash (min-width:700px) { .sparkline-svg.exp { height:56px; } }


    .tile {
      border: var(--sc-tile-border-width, 1px) solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate; box-shadow: var(--sc-tile-shadow, none);
    }

    /* A tile_layout row holding two or more blocks side by side. Blocks share the
       width evenly; min-width:0 lets a graph or chip row shrink rather than
       overflow the tile. A block renders nothing when it doesn't apply to the
       device, so a row whose blocks all opted out has no element children — hide
       it, else the tile's flex gap leaves a phantom band. */
    .tile-row { display:flex; gap:6px; align-items:flex-start; }
    .tile-row > * { flex:1 1 0; min-width:0; }
    .tile-row:not(:has(*)) { display:none; }

    .tile--clickable { cursor:default; }

    .tile-trigger { cursor:pointer; }
    /* Whole tile opens the detail sheet; interactive controls keep their own cursor */
    .tile--clickable { cursor:pointer; }
    .tile--clickable button, .tile--clickable a, .tile--clickable input,
    .tile--clickable .ts-light-wheel, .tile--clickable .trv-dial-svg,
    .tile--clickable .valve-interactive, .tile--clickable hdd-delegated { cursor:auto; }
    .tile--clickable button, .tile--clickable a { cursor:pointer; }

    .tile::after {
      content:''; position:absolute; inset:0; z-index:-1; pointer-events:none;
      background:var(--sc-tile-bg);
      background-image:var(--sc-tile-bg-image); background-size:var(--sc-tile-bg-image-sz); background-position:center; background-repeat:no-repeat;
      opacity:var(--sc-tile-bg-opacity,1); transition:opacity 0.15s, background 0.15s;
    }

    .tile::before {
      content:''; position:absolute; top:0;left:0;right:0; height:2px;
      background:linear-gradient(90deg,var(--sc-accent),transparent); opacity:0; transition:opacity 0.2s; z-index:1;
    }

    .tile:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--sc-tile-hover-shad); }

    .tile:hover::after { background-color:var(--sc-tile-hover-bg); }

    .tile--clickable:hover::before { opacity:1; }

    .tile.offline { opacity:.45; filter:grayscale(.4); }

    .tile.expanded { border-color:var(--sc-accent); box-shadow:0 0 0 1px var(--sc-accent),0 4px 12px var(--sc-accent-glow); transform:none; }

    .tile.expanded::after { background-color:var(--sc-tile-exp-bg); }

    .tile.expanded::before { opacity:1; }

    .tile.tile-sm { padding:7px 9px; gap:4px; }

    .tile.tile-lg { padding:15px 17px; gap:9px; }


    @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }


    .tile-top { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; }

    .tile-left { display:flex; align-items:center; gap:6px; min-width:0; flex:1; }


    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    .dot.online { background:var(--sc-online-color); box-shadow:0 0 0 0 var(--sc-online-glow); animation:pulse-dot 2.5s ease-in-out infinite; }

    .dot.offline { background:var(--sc-offline-dot); }

    @keyframes pulse-dot { 0%{box-shadow:0 0 0 0 var(--sc-online-glow)} 60%{box-shadow:0 0 0 5px transparent} 100%{box-shadow:0 0 0 0 var(--sc-online-glow)} }


    .tile-name { font-size:calc(var(--sc-text-scale,1) * .88em); font-weight:600; color:var(--sc-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }

    .update-dot { color:var(--sc-update-color); font-size:.65em; flex-shrink:0; animation:blink 2s step-end infinite; }

    @keyframes blink { 50%{opacity:.3} }


    /* ── Tile icons ── */
    .tile-icon { width:calc(18px * var(--ent-size, 1)); height:calc(18px * var(--ent-size, 1)); flex-shrink:0; color:var(--sc-text-muted); transition:color .3s, filter .3s; }


    /* Relay / plug — lightning bolt */

    @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,var(--sc-accent-glow)))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,var(--sc-accent-glow)))} }


    /* Fan — spinning blades */



    @keyframes fan-spin { to{transform:rotate(360deg)} }


    /* Sun — rotate + glow */




    /* Cover — slat movement */

    @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }


    /* Flame — flicker */



    @keyframes flicker { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }


    /* Valve — drip pulse */


    @keyframes drip { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }


    /* Energy — wave scroll */


    @keyframes wave-scroll { to{stroke-dashoffset:-40} }


    /* Input — ripple */




    /* ── Entity-level state animation icons ─────────────────────────────── */
    .ent-icon { width:calc(15px * var(--ent-size, 1)); height:calc(15px * var(--ent-size, 1)); flex-shrink:0; transition:color .3s,filter .3s; }

    .ent-icon-flame.off { color:#4b5563; }

    .ent-icon-flame.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.55)); }

    .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }

    .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }

    .ent-icon-snowflake { color:#7dd3fc; }

    .ent-icon-snowflake .snow-arms { animation:snow-spin calc(6s / var(--ent-spd,1)) linear infinite; }

    @keyframes snow-spin { to { transform:rotate(360deg); } }

    .ent-icon-fan.off { color:#4b5563; }

    .ent-icon-fan.on  { color:var(--sc-accent); }

    .ent-icon-fan.on .fan-blades { animation:fan-spin calc(1s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-pulse.off { color:#4b5563; }

    .ent-icon-pulse.on  { color:var(--sc-accent); }

    .ent-icon-pulse.on .pulse-ring { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-wave { color:var(--sc-accent); }

    .ent-icon-wave .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-sun.off { color:#4b5563; }

    .ent-icon-sun.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }

    .ent-icon-sun.on .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-lightning.off { color:#4b5563; }

    .ent-icon-lightning.on  { --ipglow:rgba(251,191,36,0.55); color:#fbbf24; animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-heart.off { color:#4b5563; }

    .ent-icon-heart.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.55)); }

    .ent-icon-heart.on .heart-shape { animation:heartbeat calc(1s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    @keyframes heartbeat { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }

    .ent-icon-bulb.off { color:#6b7280; }

    .ent-icon-bulb.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }

    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2 { opacity:0.3; }

    .ent-icon-bulb.on  { --ipglow:rgba(253,224,71,0.65); color:#fde047; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-leaf.off { color:#4b5563; }

    .ent-icon-leaf.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.5)); }

    .ent-icon-leaf.on .leaf-body { animation:leaf-sway calc(3s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }

    @keyframes leaf-sway { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }

    .ent-icon-moon.off { color:#4b5563; }

    .ent-icon-moon.on  { --ipglow:rgba(196,181,253,0.55); color:#c4b5fd; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-water.off { color:#4b5563; }

    .ent-icon-water.on  { color:#38bdf8; filter:drop-shadow(0 0 5px rgba(56,189,248,0.5)); }

    .ent-icon-water.on .drop-body { animation:drip calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-lock.off { color:#4b5563; }

    .ent-icon-lock.on  { --ipglow:rgba(167,139,250,0.55); color:#a78bfa; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Flame variants ── */
    .ent-icon-flame2.off,.ent-icon-flame3.off { color:#4b5563; }

    .ent-icon-flame2.on  { color:#f97316; filter:drop-shadow(0 0 6px rgba(249,115,22,0.55)); }

    .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }

    .ent-icon-flame2.on .flame-b { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }

    .ent-icon-flame3.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.5)); }

    .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }

    /* ── Snowflake variants ── */
    .ent-icon-snowflake2 { color:#7dd3fc; }

    .ent-icon-snowflake2 .snow-arms { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-snowflake3 { color:#7dd3fc; }

    .ent-icon-snowflake3 .snow-drift-g { animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

    @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }

    /* ── Fan variants ── */
    .ent-icon-fan2.off,.ent-icon-fan3.off { color:#4b5563; }

    .ent-icon-fan2.on  { color:var(--sc-accent); }

    .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-fan3.on  { color:var(--sc-accent); }

    .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }

    /* ── Lightning variants ── */
    .ent-icon-lightning2.off,.ent-icon-lightning3.off { color:#4b5563; }

    .ent-icon-lightning2.on { --ipglow:rgba(251,191,36,0.6); color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }

    .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }

    @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }

    .ent-icon-lightning3.off .arc-path { opacity:0.2; }

    .ent-icon-lightning3.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.6)); }

    .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

    @keyframes arc-flash { 0%,100%{opacity:0.15} 50%{opacity:1} }

    /* ── Bulb variants ── */
    .ent-icon-bulb2.off { color:#6b7280; }

    .ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }

    .ent-icon-bulb2.off .bulb-filament { display:none; }

    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }

    .ent-icon-bulb2.on { --ipglow:rgba(251,191,36,0.7); color:#fbbf24; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-bulb3.off { color:#6b7280; }

    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }

    .ent-icon-bulb3.on { --ipglow:rgba(224,242,254,0.7); color:#e0f2fe; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Water variants ── */
    .ent-icon-water2 { color:#38bdf8; }

    .ent-icon-water2 .wave-a { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-water2 .wave-b { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-water3.off { color:#4b5563; }

    .ent-icon-water3.on  { --ipglow:rgba(56,189,248,0.5); color:#38bdf8; }

    .ent-icon-water3.on .ripple1 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-water3.on .ripple2 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

    @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }

    /* ── Sun variants ── */
    .ent-icon-sun2.off,.ent-icon-sun3.off { color:#4b5563; }

    .ent-icon-sun2.on { --ipglow:rgba(251,191,36,0.5); color:#fbbf24; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-sun3.on { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }

    .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }

    /* ── Moon variants ── */
    .ent-icon-moon2.off,.ent-icon-moon3.off { color:#4b5563; }

    .ent-icon-moon2.on { --ipglow:rgba(241,245,249,0.6); color:#f1f5f9; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-moon3.on { color:#c4b5fd; filter:drop-shadow(0 0 6px rgba(196,181,253,0.55)); }

    .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

    .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }

    @keyframes twinkle { 0%,100%{opacity:1} 50%{opacity:0.15} }

    @keyframes wind-blow { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }

    @keyframes bell-ring { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }

    @keyframes therm-pulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }

    @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }

    @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }

    @keyframes ekg-scan { to{stroke-dashoffset:-50} }

    @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }


    /* ── Wind ──────────────────────────────────────────────────── */
    .ent-icon-wind.off,.ent-icon-wind2.off,.ent-icon-wind3.off { color:#4b5563; }

    .ent-icon-wind.on  { color:#a5f3fc; filter:drop-shadow(0 0 5px rgba(165,243,252,0.45)); }

    .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }

    .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }

    .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-wind2.on { color:#a5f3fc; filter:drop-shadow(0 0 4px rgba(165,243,252,0.4)); }

    .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }

    .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }

    .ent-icon-wind3.on { color:#a5f3fc; --ipglow:rgba(165,243,252,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* ── Bell ──────────────────────────────────────────────────── */
    .ent-icon-bell.off,.ent-icon-bell2.off,.ent-icon-bell3.off { color:#4b5563; }

    .ent-icon-bell.on  { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 5px rgba(253,230,138,0.4)); animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }

    .ent-icon-bell2.on { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 4px rgba(253,230,138,0.35)); }

    .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }

    .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-bell3.on { color:#fca5a5; --ipglow:rgba(252,165,165,0.55); animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* ── Thermometer ────────────────────────────────────────────── */
    .ent-icon-thermometer.off,.ent-icon-thermometer2.off,.ent-icon-thermometer3.off { color:#4b5563; }

    .ent-icon-thermometer.on  { color:#fb923c; filter:drop-shadow(0 0 5px rgba(251,146,60,0.5)); }

    .ent-icon-thermometer.on .therm-mercury { animation:therm-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }

    .ent-icon-thermometer2.on { color:#f87171; filter:drop-shadow(0 0 5px rgba(248,113,113,0.5)); }

    .ent-icon-thermometer2.on .therm-arrow { animation:cover-bounce calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-thermometer3.on { color:#fb923c; filter:drop-shadow(0 0 4px rgba(251,146,60,0.45)); }

    .ent-icon-thermometer3.on .therm-up   { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-thermometer3.on .therm-down { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }


    /* ── Battery ────────────────────────────────────────────────── */
    .ent-icon-battery.off,.ent-icon-battery2.off { color:#4b5563; }

    .ent-icon-battery.on  { color:#4ade80; --ipglow:rgba(74,222,128,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-battery2.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }

    .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-battery3      { color:#f87171; }

    .ent-icon-battery3.off  { color:#6b7280; }

    .ent-icon-battery3.on   { color:#f87171; filter:drop-shadow(0 0 4px rgba(248,113,113,0.5)); animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }


    /* ── Star ───────────────────────────────────────────────────── */
    .ent-icon-star.off,.ent-icon-star2.off,.ent-icon-star3.off { color:#4b5563; }

    .ent-icon-star.on  { color:#fde047; --ipglow:rgba(253,224,71,0.55); filter:drop-shadow(0 0 6px rgba(253,224,71,0.45)); animation:star-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    .ent-icon-star2.on { color:#fde047; filter:drop-shadow(0 0 5px rgba(253,224,71,0.4)); }

    .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }

    .ent-icon-star3.on { color:#fde047; filter:drop-shadow(0 0 4px rgba(253,224,71,0.4)); animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }


    /* ── Media block: the card's own media player control ── */
    .tile-media { display:flex; flex-direction:column; gap:6px; padding:4px 0 2px; }
    .tile-media-now { display:flex; align-items:center; gap:8px; min-width:0; }
    .tile-media-state { font-size:.65em; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:10px; background:rgba(255,255,255,.07); color:var(--sc-text-muted); flex-shrink:0; }
    .tile-media-state.on { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); }
    .tile-media-title { flex:1; min-width:0; font-size:.82em; color:var(--sc-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tile-media-sel { max-width:45%; flex-shrink:0; }
    .tile-media-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .tile-media-btn { width:30px; height:28px; border:1px solid var(--sc-tog-off-border); border-radius:8px; background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:.9em; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; transition:border-color .15s,color .15s,background .15s; }
    .tile-media-btn:hover { border-color:var(--sc-accent); color:var(--sc-accent); }
    .tile-media-btn.on { background:var(--sc-accent); border-color:var(--sc-accent); color:#fff; }
    .tile-media-vol { flex:1; min-width:60px; accent-color:var(--sc-accent); cursor:pointer; }
    .tile-media-pct { font-size:.72em; color:var(--sc-text-muted); font-variant-numeric:tabular-nums; min-width:32px; text-align:right; }

    /* ── Screens, appliances, heating, safety, strips, doors (2026-09) ── */
    @keyframes screen-flicker { 0%,100%{opacity:.35} 7%{opacity:.5} 11%{opacity:.22} 30%{opacity:.42} 46%{opacity:.18} 60%{opacity:.46} 78%{opacity:.3} }
    @keyframes scanline       { 0%{transform:translateY(0)} 100%{transform:translateY(6.8px)} }
    @keyframes screen-wake    { 0%{transform:scale(.06,.08);opacity:0} 35%{transform:scale(1,.1);opacity:1} 65%{transform:scale(1,1);opacity:.7} 100%{transform:scale(1,1);opacity:.4} }
    @keyframes heat-rise      { 0%{transform:translateY(2px);opacity:0} 40%{opacity:.9} 100%{transform:translateY(-3px);opacity:0} }
    @keyframes drum-tumble    { 0%{transform:rotate(0)} 45%{transform:rotate(320deg)} 60%{transform:rotate(290deg)} 100%{transform:rotate(360deg)} }
    @keyframes led-chase      { 0%,100%{opacity:.25} 20%{opacity:1} }
    /* Same function list at both ends, or the filter interpolates discretely
       and the hue never rotates — see anim-icons.ts. */
    @keyframes hue-cycle      { from{filter:drop-shadow(0 0 4px currentColor) hue-rotate(0deg)} to{filter:drop-shadow(0 0 4px currentColor) hue-rotate(360deg)} }
    @keyframes garage-door    { 0%,15%{transform:scaleY(1)} 45%,55%{transform:scaleY(.12)} 85%,100%{transform:scaleY(1)} }
    @keyframes spark-pop      { 0%,70%,100%{opacity:0;transform:scale(.6)} 75%,85%{opacity:1;transform:scale(1)} }

    .ent-icon-display.off,.ent-icon-display2.off,.ent-icon-display3.off { color:#4b5563; }
    .ent-icon-display.on,.ent-icon-display2.on,.ent-icon-display3.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.45)); }
    .ent-icon-display.on  .scr-panel { animation:screen-flicker calc(2.4s / var(--ent-spd,1)) steps(1,end) infinite; }
    .ent-icon-display2.on .scr-line  { animation:scanline calc(2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-display3.on .scr-wake  { animation:screen-wake calc(3s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-oven.off,.ent-icon-floorheat.off,.ent-icon-radiator.off { color:#4b5563; }
    .ent-icon-oven.on,.ent-icon-floorheat.on { color:#fb923c; filter:drop-shadow(0 0 4px rgba(251,146,60,0.45)); }
    .ent-icon-radiator.on { color:#f87171; filter:drop-shadow(0 0 4px rgba(248,113,113,0.45)); }
    .ent-icon-oven.on .heat-a,.ent-icon-floorheat.on .heat-a,.ent-icon-radiator.on .heat-a { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; }
    .ent-icon-oven.on .heat-b,.ent-icon-floorheat.on .heat-b,.ent-icon-radiator.on .heat-b { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.55s / var(--ent-spd,1)); }
    .ent-icon-oven.on .heat-c,.ent-icon-floorheat.on .heat-c,.ent-icon-radiator.on .heat-c { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1.1s / var(--ent-spd,1)); }
    .ent-icon-oven.off .heat-a,.ent-icon-oven.off .heat-b,.ent-icon-oven.off .heat-c,
    .ent-icon-floorheat.off .heat-a,.ent-icon-floorheat.off .heat-b,.ent-icon-floorheat.off .heat-c,
    .ent-icon-radiator.off .heat-a,.ent-icon-radiator.off .heat-b,.ent-icon-radiator.off .heat-c { opacity:0; }

    .ent-icon-washer.off,.ent-icon-washer2.off,.ent-icon-dishwasher.off { color:#4b5563; }
    .ent-icon-washer.on,.ent-icon-washer2.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.4)); }
    .ent-icon-dishwasher.on { color:#38bdf8; filter:drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
    .ent-icon-washer.on  .drum { animation:fan-spin calc(1.6s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-washer2.on .drum { animation:drum-tumble calc(2.4s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-washer.on .drum-water,.ent-icon-washer2.on .drum-water { animation:wave-scroll calc(1.8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-washer.off .drum-water,.ent-icon-washer2.off .drum-water { opacity:0; }
    .ent-icon-dishwasher.on .spray-arm { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-dishwasher.on .spray-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-dishwasher.on .spray-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
    .ent-icon-dishwasher.off .spray-a,.ent-icon-dishwasher.off .spray-b { opacity:0; }

    .ent-icon-valve.off { color:#4b5563; }
    .ent-icon-valve.on { color:#38bdf8; filter:drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
    .ent-icon-valve.on .wheel { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; }

    .ent-icon-smoke.off { color:#6b7280; }
    .ent-icon-smoke.on  { color:#f87171; --ipglow:rgba(248,113,113,0.6); }
    .ent-icon-smoke.on  .det-led  { animation:blink calc(0.5s / var(--ent-spd,1)) step-end infinite; }
    .ent-icon-smoke.on  .det-ring { animation:icon-pulse calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-smoke.off .det-led  { fill:#4ade80; animation:blink calc(3s / var(--ent-spd,1)) step-end infinite; }

    .ent-icon-camera.off { color:#4b5563; }
    .ent-icon-camera.on  { color:#e2e8f0; }
    .ent-icon-camera.on .rec-dot { animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }
    .ent-icon-camera.off .rec-dot { fill:currentColor; opacity:.4; }

    .ent-icon-strip.off,.ent-icon-strip2.off { color:#4b5563; }
    .ent-icon-strip.on  { color:#c084fc; filter:drop-shadow(0 0 4px rgba(192,132,252,0.45)); }
    .ent-icon-strip2.on { color:#f472b6; animation:hue-cycle calc(4s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-strip.on .led-1 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-strip.on .led-2 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.2s / var(--ent-spd,1)); }
    .ent-icon-strip.on .led-3 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }
    .ent-icon-strip.on .led-4 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
    .ent-icon-strip.on .led-5 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
    .ent-icon-strip2.on .led-1 { fill:#f87171; } .ent-icon-strip2.on .led-2 { fill:#fbbf24; } .ent-icon-strip2.on .led-3 { fill:#4ade80; }
    .ent-icon-strip2.on .led-4 { fill:#38bdf8; } .ent-icon-strip2.on .led-5 { fill:#a78bfa; }
    .ent-icon-strip.off .led,.ent-icon-strip2.off .led { opacity:.35; }

    .ent-icon-plug.off { color:#4b5563; }
    .ent-icon-plug.on  { color:#fde68a; filter:drop-shadow(0 0 4px rgba(253,230,138,0.4)); }
    .ent-icon-plug.on  .spark { animation:spark-pop calc(2s / var(--ent-spd,1)) ease-out infinite; transform-origin:14.6px 4.3px; }
    .ent-icon-plug.off .spark { opacity:0; }

    .ent-icon-garage.off { color:#4b5563; }
    .ent-icon-garage.on  { color:#cbd5e1; }
    .ent-icon-garage.on .door { animation:garage-door calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-ble.off { color:#4b5563; }
    .ent-icon-ble.on  { color:#60a5fa; filter:drop-shadow(0 0 4px rgba(96,165,250,0.45)); }
    .ent-icon-ble.on .ble-ring { animation:ripple-out calc(1.6s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-router.off { color:#4b5563; }
    .ent-icon-router.on  { color:#34d399; filter:drop-shadow(0 0 4px rgba(52,211,153,0.4)); }
    .ent-icon-router.on .led-1 { animation:led-chase calc(1.1s / var(--ent-spd,1)) steps(1,end) infinite; }
    .ent-icon-router.on .led-2 { animation:led-chase calc(0.7s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
    .ent-icon-router.on .led-3 { animation:led-chase calc(1.3s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.8s / var(--ent-spd,1)); }
    .ent-icon-router.off .led { opacity:.3; }

    .ent-icon-pc.off { color:#4b5563; }
    .ent-icon-pc.on  { color:#93c5fd; filter:drop-shadow(0 0 4px rgba(147,197,253,0.4)); }
    .ent-icon-pc.on .pwr   { animation:blink calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-pc.on .act-1 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; }
    .ent-icon-pc.on .act-2 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; }
    .ent-icon-pc.on .act-3 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; animation-delay:calc(-0.35s / var(--ent-spd,1)); }
    .ent-icon-pc.off .act  { opacity:.3; }
    .ent-icon-pc.off .pwr  { opacity:.4; }

    /* ── Pulse variants ─────────────────────────────────────────── */
    .ent-icon-pulse2.off,.ent-icon-pulse3.off { color:#4b5563; }

    .ent-icon-pulse2.on { color:var(--sc-accent); }

    .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; }

    .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-pulse3.on { color:#f43f5e; filter:drop-shadow(0 0 4px rgba(244,63,94,0.45)); }

    .ent-icon-pulse3.on .ekg-line { animation:ekg-scan calc(1.5s / var(--ent-spd,1)) linear infinite; stroke-dasharray:50; stroke-dashoffset:0; }


    /* ── Wave variants ──────────────────────────────────────────── */
    .ent-icon-wave2.off,.ent-icon-wave3.off,.ent-icon-wave4.off { color:#4b5563; }

    .ent-icon-wave2.on { color:#5eead4; filter:drop-shadow(0 0 4px rgba(94,234,212,0.4)); }

    .ent-icon-wave2.on .bar-odd  { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:50% 100%; }

    .ent-icon-wave2.on .bar-even { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }

    .ent-icon-wave3.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.4)); }

    .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }

    .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

    .ent-icon-wave4.on { color:#93c5fd; filter:drop-shadow(0 0 4px rgba(147,197,253,0.4)); }

    .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }

    .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }

    .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }


    /* ── Heart variant ──────────────────────────────────────────── */
    .ent-icon-heart2.off { color:#4b5563; }

    .ent-icon-heart2.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.5)); }

    .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }


    /* ── Leaf variant ───────────────────────────────────────────── */
    .ent-icon-leaf2.off { color:#4b5563; }

    .ent-icon-leaf2.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.45)); animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }


    /* ── Lock variant ───────────────────────────────────────────── */
    .ent-icon-lock2.off { color:#4b5563; }

    .ent-icon-lock2.on  { color:#7ecfff; --ipglow:rgba(126,207,255,0.55); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }


    /* Legacy boxed chips — still used by area headers and the detail sheet */

    .tile-sensor-chip { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px 7px; min-width:38px; max-width:100%; overflow:hidden; }

    .tsc-lbl { font-size:var(--fs-xs); color:var(--sc-text-muted); letter-spacing:.02em; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .tsc-val { font-size:var(--fs-sm); color:var(--sc-text-primary); font-weight:500; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .tile-sensor-chip.warn .tsc-val { color:var(--sc-accent); }

    /* ── Three-tier tile stats ──────────────────────────────────── */
    /* Primary: large unboxed values with inline units */
    .tile-stats { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 14px; margin:4px 0 0; min-width:0; }

    .stat-item { font-size:var(--fs-md); font-weight:600; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; white-space:nowrap; display:inline-flex; align-items:baseline; gap:4px; }

    .stat-item.warn { color:var(--sc-accent); }

    .stat-lbl { font-size:var(--fs-xs); font-weight:500; color:var(--sc-text-muted); }

    /* Electrical: one compound strip per channel */
    .tile-elec-wrap { display:flex; flex-direction:column; gap:2px; margin:4px 0 0; min-width:0; }

    .tile-elec { display:flex; align-items:baseline; gap:6px; font-size:var(--fs-sm); color:var(--sc-text-detail); font-variant-numeric:tabular-nums; background:var(--sc-tile-sensor-bg, rgba(255,255,255,.04)); border-radius:6px; padding:3px 8px; width:fit-content; max-width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

    /* Diagnostics: single muted footer line */
    .tile-diag { display:flex; align-items:baseline; gap:6px; margin-top:4px; padding-top:4px; border-top:1px solid rgba(255,255,255,.06); font-size:var(--fs-xs); color:var(--sc-text-muted); white-space:nowrap; overflow:hidden; min-width:0; }

    .tile-diag > span { overflow:hidden; text-overflow:ellipsis; }

    .tile-diag .warn { color:var(--sc-accent); }

    .sep { opacity:.4; flex-shrink:0; }


    .tile-bot { display:flex; align-items:center; justify-content:space-between; gap:4px; min-width:0; }

    .tile-power { font-size:var(--fs-md); font-weight:700; color:var(--sc-power-color); font-variant-numeric:tabular-nums; }

    .tile-badges { display:flex; gap:4px; align-items:center; margin-left:auto; }

    .type-badge,.gen-badge,.int-badge-tile { font-size:10px; font-weight:600; letter-spacing:.03em; padding:2px 5px; border-radius:4px; line-height:1.4; white-space:nowrap; }

    /* Badge text is the hue mixed 55/45 with the theme's primary text, so the
       same rule reads as a pastel on a dark tile and as a deep tint on a light
       one — fixed pastels vanished on the Follow-HA light theme. */
    .type-badge, .gen-badge { --bd: #9ca3af; background:color-mix(in srgb, var(--bd) 22%, transparent); color:color-mix(in srgb, var(--bd) 55%, var(--sc-text-primary)); }

    .type-relay       { --bd:#6366f1; }

    .type-dimmer      { --bd:#eab308; }

    .type-rgb         { --bd:#ec4899; }

    .type-plug        { --bd:#22c55e; }

    .type-cover       { --bd:#0ea5e9; }

    .type-energy      { --bd:#f59e0b; }

    .type-sensor      { --bd:#14b8a6; }

    .type-input       { --bd:#a855f7; }

    .type-climate     { --bd:#ef4444; }

    .gen-1   { --bd:#6b7280; }

    .gen-2   { --bd:#3b82f6; }

    .gen-3   { --bd:#22c55e; }

    .gen-4   { --bd:#a855f7; }

    .gen-ble { --bd:#06b6d4; }

    .int-badge-tile { background:color-mix(in srgb, var(--sc-text-muted) 12%, transparent); color:var(--sc-text-muted); }

    .tile-ui-link { font-size:11px; font-weight:700; color:var(--sc-accent); text-decoration:none; padding:1px 4px; border-radius:4px; opacity:.75; transition:opacity .15s; }

    .tile-ui-link:hover { opacity:1; }


    .alert-badge { font-size:10px; font-weight:700; padding:2px 5px; border-radius:4px; white-space:nowrap; animation:blink 1.5s step-end infinite; }

    .alert-overtemp  { background:rgba(251,146,60,.25); color:#fdba74; }

    .alert-overpower { background:rgba(239,68,68,.25);  color:#fca5a5; }


    .tog { padding:var(--tog-pad,4px 11px); border:none; border-radius:var(--tog-radius,20px); aspect-ratio:var(--tog-aspect,auto); cursor:pointer; font-size:var(--tog-fsize,.72em); font-weight:700; letter-spacing:.05em; flex-shrink:0; transition:transform .1s,opacity .15s,box-shadow .15s; position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; }

    .tog::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition:opacity .15s; }

    .tog:active::after { opacity:.15; }

    .tog.sm { padding:2px 9px; font-size:.68em; }

    .tog.on { background:var(--tog-on-bg,linear-gradient(135deg,var(--sc-accent),color-mix(in srgb,var(--sc-accent) 70%,#f97316))); color:var(--tog-on-color,white); box-shadow:var(--tog-on-shadow,0 2px 8px var(--sc-accent-glow)); border:var(--tog-on-border,none); }

    .tog.off { background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); border:1px solid var(--sc-tog-off-border); }

    .tog.update { background:linear-gradient(135deg,var(--sc-update-color),color-mix(in srgb,var(--sc-update-color) 60%,#f97316)); color:white; box-shadow:0 2px 6px var(--sc-update-glow); }

    .tog:hover { opacity:.85; transform:scale(1.04); }

    .tog:active { transform:scale(.96); }


    .tile-dim-row { display:flex; align-items:center; gap:8px; }

    .dim-slider { flex:1; min-width:0; cursor:pointer; accent-color:var(--sc-accent); appearance:none; -webkit-appearance:none; height:4px; background:transparent; }

    .dim-slider:disabled { opacity:.3; }

    /* The track is mixed from the muted text colour, not the tile border: a theme
       that follows HA maps the border to --divider-color at 12% alpha, which made
       the track invisible on both light and dark surfaces. */
    .dim-slider::-webkit-slider-runnable-track { height:4px; border-radius:2px; background:color-mix(in srgb, var(--sc-text-muted) 35%, transparent); }

    .dim-slider::-moz-range-track { height:4px; border-radius:2px; background:color-mix(in srgb, var(--sc-text-muted) 35%, transparent); border:none; }

    .dim-slider::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none; width:14px; height:14px; border-radius:50%;
      background:var(--sc-accent); border:2px solid var(--sc-text-value); margin-top:-5px; cursor:pointer;
      box-shadow:0 0 0 1px var(--sc-tile-border); transition:transform 0.12s;
    }

    .dim-slider::-moz-range-thumb {
      width:14px; height:14px; border-radius:50%;
      background:var(--sc-accent); border:2px solid var(--sc-text-value); cursor:pointer;
      box-shadow:0 0 0 1px var(--sc-tile-border); transition:transform 0.12s;
    }

    .dim-slider:hover::-webkit-slider-thumb { transform:scale(1.15); }

    .dim-slider:hover::-moz-range-thumb { transform:scale(1.15); }

    .dim-pct { font-size:var(--fs-sm); font-weight:600; color:var(--sc-text-secondary); min-width:30px; text-align:right; }

    .color-swatch { width:30px; height:20px; border-radius:5px; border:none; cursor:pointer; padding:1px; background:transparent; flex-shrink:0; }

    .color-swatch:disabled { opacity:.3; }


    .cov-btns { display:flex; gap:2px; }

    .cov-btn { background:var(--sc-tog-off-bg); border:1px solid var(--sc-tog-off-border); border-radius:6px; color:var(--sc-text-primary); cursor:pointer; font-size:10px; padding:5px 10px; transition:background .15s; min-height:24px; }

    .cov-btn:hover { background:var(--sc-hover-bg); }

    .cov-btn.stop { color:var(--sc-text-muted); }

    .cov-pos-row { display:flex; align-items:center; gap:6px; }

    .cov-bar { flex:1; height:4px; background:rgba(255,255,255,.10); border-radius:3px; overflow:hidden; }

    .cov-fill { height:100%; background:var(--sc-accent); border-radius:3px; transition:width .4s; }

    .cov-pct { font-size:10px; color:var(--sc-text-secondary); min-width:34px; text-align:right; }






    .trv-flame { font-size:.75em; flex-shrink:0; }


    .trv-step { width:28px;height:28px; border:1px solid var(--sc-tog-off-border); border-radius:6px; background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); font-size:1em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }

    .trv-step:hover { background:var(--sc-accent); color:white; }







    .tile-trv-dial { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; width:100%; padding:4px 0; }

    .trv-dial-svg { width:100%; max-width:200px; height:auto; overflow:visible; }

    .dial-target-text { font-size:30px; font-weight:700; fill:var(--sc-text-primary,#fff); }

    .dial-sub-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }

    .dial-current-text { font-size:13px; fill:var(--sc-text-secondary,rgba(255,255,255,0.65)); }

    .dial-range-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }

    .trv-dial-btns { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:2px; width:100%; }

    .trv-stat-row { display:flex; gap:10px; justify-content:center; margin-top:4px; }

    .trv-stat { display:flex; flex-direction:column; align-items:center; }

    .trv-stat-lbl { font-size:10px; color:var(--sc-text-secondary,rgba(255,255,255,0.55)); }

    .trv-stat-val { font-size:13px; font-weight:600; color:var(--sc-text-primary,#fff); }

    .trv-presets { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin-top:6px; }

    .trv-preset-btn { font-size:11px; padding:3px 8px; border-radius:12px; border:1px solid var(--sc-border); background:transparent; color:var(--sc-text-primary); cursor:pointer; white-space:nowrap; }

    .trv-preset-btn.active { background:var(--sc-accent,#e67e22); border-color:var(--sc-accent,#e67e22); color:#fff; }


    .valve-interactive { cursor:pointer; touch-action:none; }

    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:10px; }

    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }

    .valve-btn:hover { background:var(--sc-hover-bg); }

    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }

    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }

    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }



    .tile-inputs { display:flex; flex-direction:column; gap:5px; }

    /* The row wraps: name · status · age on the first line, and the action
       button + dropdown chip as ONE unit that drops to its own right-aligned
       line when the tile is narrow — on a phone they were squeezed into the
       corner with the chip clipped off the tile. */
    .input-row { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; padding:5px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.04); transition:all .15s; }
    /* flex-shrink:0, not min-width:0. With min-width:0 this box shrank instead
       of wrapping, so the button's max-width was a percentage of a collapsing
       container and a label ellipsised down to one or two characters — "S…"
       for Stokkur. Refusing to shrink is what makes it wrap to its own line,
       which is what the comment above always claimed happened. */
    .input-row-act { display:flex; align-items:center; gap:6px; margin-left:auto; max-width:100%; flex-shrink:0; }
    .input-row-act:empty { display:none; }

    .input-row.active { background:color-mix(in srgb,var(--sc-accent) 15%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 35%,transparent); }

    .input-row-dot { width:8px; height:8px; border-radius:50%; background:var(--sc-text-muted); flex-shrink:0; transition:background .15s; }

    .input-row.active .input-row-dot { background:var(--sc-accent); }

    .input-btn-dot { width:8px; height:8px; border-radius:2px; background:rgba(129,140,248,0.5); flex-shrink:0; }

    .input-row.btn-mode { border-color:rgba(129,140,248,0.18); }
    .input-row.tappable { cursor:pointer; }
    .input-row.tappable:hover { background:color-mix(in srgb, var(--sc-text-muted) 12%, transparent); }
    /* A switch-kind input reads as a state, not an event: a small pill that
       lights with the accent while the input is closed. */
    .input-row.sw-mode .input-row-event { padding:1px 7px; border-radius:999px; font-size:10px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; background:color-mix(in srgb, var(--sc-text-muted) 18%, transparent); }
    .input-row.sw-mode .input-row-event.is-on { background:color-mix(in srgb, var(--sc-accent) 25%, transparent); color:var(--sc-accent); }

    .input-row-name { font-size:13px; font-weight:600; color:var(--sc-text-primary); min-width:0; max-width:55%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    .input-row-event { flex:1 1 auto; min-width:0; font-size:12px; color:var(--sc-text-secondary); text-transform:capitalize; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    .input-row-time { font-size:11px; color:var(--sc-text-muted); white-space:nowrap; }
    /* Delegate notice: the setting name is a link only inside the editor preview. */
    .dn-link { font:inherit; font-weight:700; color:var(--sc-accent); background:none;
      border:none; padding:0; cursor:pointer; text-decoration:underline;
      text-underline-offset:2px; }
    .dn-link:hover { filter:brightness(1.15); }
    /* The integrations responsible, named but subordinate to the count. */
    .dn-dim { opacity:.7; }
    /* Action button on an input row — i3/i4 inputs have no output of their own,
       so this runs the action assigned to the channel. */
    .input-act { max-width:100%; min-width:0; padding:3px 9px; border-radius:999px; cursor:pointer;
      font:inherit; font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden;
      text-overflow:ellipsis; flex-shrink:0;
      color:var(--sc-accent); background:color-mix(in srgb,var(--sc-accent) 14%,transparent);
      border:1px solid color-mix(in srgb,var(--sc-accent) 38%,transparent);
      transition:background .15s, transform .1s; }
    .input-act:hover { background:color-mix(in srgb,var(--sc-accent) 26%,transparent); }
    .input-act:active { transform:scale(.94); }
    /* Holdable rows must not scroll or select the label while being held. */
    .input-act.holdable { touch-action:none; user-select:none; -webkit-user-select:none;
      border-style:dashed; }
    /* A ramping hold: solid accent ring that breathes, and the label becomes
       ▲ / ▼ + the brightness percentage (see renderInputAction). */
    .input-act.dimming, .ts-key.dimming { border-style:solid; border-color:var(--sc-accent, var(--ts-accent));
      color:var(--sc-accent, var(--ts-accent)); font-variant-numeric:tabular-nums;
      animation:hdd-dim-pulse .7s ease-in-out infinite alternate; }
    @keyframes hdd-dim-pulse {
      from { box-shadow:0 0 0 0 color-mix(in srgb, var(--sc-accent, var(--ts-accent)) 55%, transparent); }
      to   { box-shadow:0 0 0 5px transparent; }
    }
    /* Dropdown chip on an input row — a select entity's options (WLED presets…). */
    .input-sel { max-width:60%; min-width:0; padding:3px 4px 3px 8px; border-radius:999px; cursor:pointer;
      font:inherit; font-size:11px; font-weight:600; flex-shrink:0;
      color:var(--sc-text-secondary); background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.14); appearance:none;
      -webkit-appearance:none; text-overflow:ellipsis; color-scheme:dark; }
    .input-sel:hover { background:rgba(255,255,255,.12); color:var(--sc-text-primary); }
    .input-sel option { background-color:#241f1b; color:#f2ece3; }





    /* ── Virtual controls ── */
    .tile-virtuals { display:flex; flex-direction:column; gap:4px; }

    /* Delegated (native HA) controls for long-tail domains — Phase 3 fallback */
    .tile-delegated { display:flex; flex-direction:column; gap:6px; margin-top:2px; }

    /* Embedded user cards (header_cards / footer_cards / area_cards).
       A twelve-column strip so a card's own grid_options.columns can place it,
       the way a sections view does. A card that sets none spans all twelve, so
       a config written before this stays full-width. */
    .extra-cards { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:12px; padding:12px; }
    .extra-cards > * { grid-column:span 12; min-width:0; }
    /* A strip whose cards have all hidden themselves is not :empty — the
       children are still there, merely display:none — so it kept its 12px of
       padding as a blank band. The hidden attribute is what hdd-card mirrors
       off the wrapper when a visibility condition fails; :has covers the empty
       case too, since "no unhidden child" is true of no children at all. */
    .extra-cards:not(:has(> *:not([hidden]))) { display:none; }

    /* area_card_placement: 'grid' — a room's cards inside the device grid,
       each taking a tile's place. min-width:0 so a wide card cannot push the
       grid past its column count.
       No display declaration here on purpose: a rule in the outer tree beats
       the shadow tree's :host rules, so display:block here overrode hdd-card's own
       :host([hidden]) { display:none } and a hidden room card went on holding
       its tile slot. hdd-card's :host already makes it a block. */
    .device-grid > .grid-card { min-width:0; }


    /* One-time notice: native controls available but off by default */
    /* Needs attention — fleet summary above the rooms. */
    .attention { margin:0 0 10px; border:1px solid color-mix(in srgb,var(--sc-offline-color) 30%,transparent);
      border-radius:12px; background:color-mix(in srgb,var(--sc-offline-color) 7%,transparent); overflow:hidden; }
    .att-hdr { display:flex; align-items:center; gap:8px; padding:9px 12px; cursor:pointer; user-select:none; }
    .att-hdr:hover { background:color-mix(in srgb,var(--sc-offline-color) 10%,transparent); }
    .att-caret { color:var(--sc-text-muted); font-size:11px; }
    .att-title { font-size:13px; font-weight:700; color:var(--sc-text-primary); }
    .att-count { min-width:20px; height:20px; padding:0 6px; border-radius:10px; display:inline-flex;
      align-items:center; justify-content:center; font-size:11px; font-weight:800;
      background:var(--sc-offline-color); color:#1e1a17; }
    .att-fw-chip { margin-left:auto; font-size:11px; color:var(--sc-text-secondary); }
    .att-body { display:flex; flex-direction:column; gap:3px; padding:0 8px 8px; }
    .att-row { display:flex; align-items:center; gap:8px; width:100%; padding:6px 8px; border-radius:8px;
      cursor:pointer; font:inherit; text-align:left; border:1px solid transparent;
      background:rgba(255,255,255,.03); color:var(--sc-text-primary); }
    .att-row:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.10); }
    .att-icon { width:14px; text-align:center; font-size:11px; }
    .att-offline .att-icon { color:var(--sc-offline-color); }
    .att-alert .att-icon, .att-battery .att-icon { color:var(--sc-power-color); }
    .att-update .att-icon { color:var(--sc-accent); }
    .att-name { font-size:12.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .att-why { flex:1; font-size:11px; color:var(--sc-text-secondary); text-transform:capitalize;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .att-area { font-size:10.5px; color:var(--sc-text-muted); white-space:nowrap; }
    .att-fw { margin-top:6px; padding-top:7px; border-top:1px solid rgba(255,255,255,.07); }
    .att-fw-title { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
      color:var(--sc-text-muted); margin:0 8px 5px; }
    .att-fw-row { display:flex; align-items:center; gap:8px; padding:2px 8px; font-size:11.5px; }
    .att-fw-ver { min-width:58px; color:var(--sc-text-secondary); font-variant-numeric:tabular-nums; }
    .att-fw-row.current .att-fw-ver { color:var(--sc-online-color); font-weight:700; }
    .att-fw-bar { flex:1; height:6px; border-radius:3px; background:rgba(255,255,255,.06); overflow:hidden; }
    .att-fw-bar i { display:block; height:100%; background:var(--sc-text-muted); }
    .att-fw-row.current .att-fw-bar i { background:var(--sc-online-color); }
    .att-fw-n { min-width:22px; text-align:right; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; }
    .att-fw-tag { font-size:9.5px; color:var(--sc-online-color); text-transform:uppercase; letter-spacing:.06em; }

    /* Lights-on count: lit while any light is on, plain when all are off. */
    .stat.lights-on { color:var(--sc-power-color); }

    .delegate-notice {
      display:flex; align-items:center; gap:10px; margin:0 12px 10px;
      padding:8px 12px; border-radius:10px;
      background:var(--sc-tile-bg); border:1px solid var(--sc-tile-border);
      font-size:.8em; color:var(--sc-text-secondary);
    }
    .delegate-notice .dn-icon { color:var(--sc-accent); flex-shrink:0; }
    .delegate-notice .dn-text { flex:1; min-width:0; }
    .delegate-notice .dn-text b { color:var(--sc-text-primary); font-weight:600; }
    .delegate-notice .dn-dismiss {
      flex-shrink:0; border:none; background:transparent; cursor:pointer;
      color:var(--sc-text-muted); font-size:1.3em; line-height:1; padding:0 4px;
    }
    .delegate-notice .dn-dismiss:hover { color:var(--sc-text-primary); }

    .virt-row { display:flex; align-items:center; gap:8px; padding:4px 8px; border-radius:7px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03); }

    .virt-lbl { font-size:11px; color:var(--sc-text-muted); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .virt-val { font-size:12px; color:var(--sc-text-primary); font-weight:500; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:capitalize; }

    .virt-select, .virt-num { display:flex; align-items:center; gap:3px; }

    .virt-arr { background:none; border:none; color:var(--sc-text-secondary); cursor:pointer; font-size:15px; padding:0 3px; line-height:1; border-radius:4px; transition:color .12s; }

    .virt-arr:hover { color:var(--sc-accent); }

    .virt-btn { background:color-mix(in srgb,var(--sc-accent) 12%,transparent); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); color:var(--sc-accent); font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; cursor:pointer; transition:all .15s; width:100%; text-align:left; }

    .virt-btn:hover { background:color-mix(in srgb,var(--sc-accent) 22%,transparent); }


    .power-bar { position:absolute; bottom:0;left:0;right:0; height:3px; background:rgba(255,255,255,.06); border-radius:0 0 var(--tile-radius) var(--tile-radius); overflow:hidden; }

    .power-bar-fill { height:100%; background:linear-gradient(90deg,var(--sc-accent),#f97316); border-radius:inherit; transition:width .4s; }


    /* ── Expanded panel ── */
    .expanded { margin-top:10px; border-top:1px solid color-mix(in srgb,var(--sc-accent) 25%,transparent); padding-top:12px; display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; animation:slide-in .2s ease; }








    /* ── Sparklines ── */
    .sparklines-block { display:flex; flex-direction:column; gap:4px; padding:4px 8px 2px; }

    .sparklines-block.exp { padding:6px 8px 4px; gap:8px; }

    .spark-group { display:flex; flex-direction:column; gap:0; }

    .spark-row { display:flex; align-items:center; gap:6px; min-height:32px; }

    .spark-lbl { font-size:var(--fs-xs); font-weight:600; letter-spacing:.02em; color:var(--sc-text-muted); width:68px; flex-shrink:0; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .spark-svg-wrap { flex:1; position:relative; min-width:0; }

    .sparkline-svg { width:100%; height:32px; display:block; overflow:visible; cursor:crosshair; }

    .sparkline-svg.exp { height:48px; }

    .spark-tick { stroke:rgba(255,255,255,.2); stroke-width:.5; stroke-dasharray:3 3; pointer-events:none; }

    .spark-crosshair { stroke:rgba(255,255,255,.35); stroke-width:.6; stroke-dasharray:2 2; pointer-events:none; }

    .spark-hover-dot { fill:var(--sc-graph-line); stroke:var(--sc-card-bg,#1e1e2e); stroke-width:1.5; pointer-events:none; }

    .spark-tooltip {
      position:absolute; bottom:calc(100% + 4px); transform:translateX(-50%);
      background:rgba(14,14,28,.92); border:1px solid rgba(255,255,255,.12); border-radius:6px;
      padding:4px 8px; pointer-events:none; white-space:nowrap; z-index:20;
      display:flex; flex-direction:column; align-items:center; gap:1px;
    }

    .spark-tooltip-val  { font-size:.78em; font-weight:700; color:var(--sc-graph-line); }

    .spark-tooltip-time { font-size:.65em; color:var(--sc-text-muted); }

    .spark-val { font-size:.75em; font-weight:600; color:var(--sc-text-secondary); white-space:nowrap; min-width:44px; text-align:right; }

    .spark-time-row { display:flex; align-items:center; gap:6px; padding-bottom:1px; }

    .spark-time-spacer { width:68px; flex-shrink:0; }

    .spark-time-labels { flex:1; display:flex; justify-content:space-between; font-size:.62em; color:var(--sc-text-muted); opacity:.65; user-select:none; }

    .spark-time-end { min-width:44px; }

    .spark-no-data { flex:1; font-size:.7em; color:var(--sc-text-muted); opacity:.6; display:flex; align-items:center; padding-left:4px; }

    .spark-retry { background:none; border:none; color:var(--sc-text-muted); font-size:1em; cursor:pointer; padding:0 4px; opacity:.6; }

    .spark-retry:hover { opacity:1; color:var(--sc-accent); }

    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .sparkline-loading { flex:1; height:32px; border-radius:4px;
      background:linear-gradient(90deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 100%);
      background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite; }

    .sparkline-loading.exp { height:48px; }


    /* ── RGBW white + effects ── */
    .tile-white-row { margin-top:2px; }

    .dim-white-lbl { font-size:.6em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:14px; flex-shrink:0; text-align:center; }

    .white-slider { accent-color:#e5e7eb; }

    .tile-effects { display:flex; gap:4px; padding:4px 8px 2px; }

    /* WLED reports ~190 effects; a chip per effect buried the tile, so this is a
       grouped dropdown (sound-reactive first) rather than a wall of buttons. */
    .effect-sel { flex:1; min-width:0; padding:5px 8px; border-radius:10px; cursor:pointer;
      font:inherit; font-size:11px; font-weight:600; appearance:none; -webkit-appearance:none;
      color:var(--sc-text-secondary); background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.12); transition:background .15s,color .15s;
      /* The native option popup renders in browser chrome, where the card's
         translucent option backgrounds don't apply — it fell back to white with
         light card text (unreadable). color-scheme:dark makes the browser paint
         the popup with dark chrome, and the explicit option colors below give a
         readable fallback on browsers that do honor them. */
      color-scheme:dark; }
    .effect-sel:hover { background:var(--sc-hover-bg); color:var(--sc-text-primary); }
    .effect-sel option, .effect-sel optgroup { background-color:#241f1b; color:#f2ece3; }




    .spark-row-clickable { cursor:pointer; border-radius:6px; transition:background .15s; }

    .spark-row-clickable:hover { background:rgba(255,255,255,.05); }


    /* ── Relay channels ── */
    .relay-channels { display:flex; flex-direction:column; gap:4px; padding:2px 8px 4px; }

    .relay-ch-row { display:flex; align-items:center; gap:8px; padding:3px 0; }

    .relay-ch-dot { width:7px; height:7px; border-radius:50%; background:var(--sc-offline-dot); flex-shrink:0; transition:background .15s; }

    .relay-ch-dot.on { background:var(--sc-online-color); }

    .relay-ch-name { flex:1; font-size:12px; color:var(--sc-text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* ── Favourites section ───────────────────────────────── */
    .fav-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }

    .fav-header {
      display:flex; align-items:center; gap:8px;
      background:rgba(255,255,255,0.04);
      padding:8px 14px; border-radius:10px 10px 0 0;
      border-bottom:1px solid var(--sc-tile-border);
    }

    .fav-star {
      font-size:13px; color:var(--sc-accent); flex-shrink:0;
      filter:drop-shadow(0 0 4px color-mix(in srgb,var(--sc-accent) 60%,transparent));
    }

    .fav-label {
      font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700);
      text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em;
      color:var(--sc-accent); flex:1;
    }

    .fav-chips { display:flex; align-items:center; gap:6px; }

    .fav-chip {
      font-size:0.72em; font-weight:600; padding:2px 8px; border-radius:12px;
    }

    .fav-chip-count {
      background:rgba(255,255,255,0.06); color:var(--sc-text-muted);
      border:1px solid rgba(255,255,255,0.08);
    }

    .fav-chip-power {
      background:color-mix(in srgb,var(--sc-accent) 18%,transparent);
      color:var(--sc-power-color);
      border:1px solid color-mix(in srgb,var(--sc-accent) 28%,transparent);
    }

    .fav-grid { padding:4px 12px 14px; }


    /* Tile wrapper — stacks the room label above the tile */
    .fav-tile-wrap { display:flex; flex-direction:column; gap:3px; }


    /* Room label — rendered above the device name in each favourite tile */
    .tile-room-badge {
      align-self:flex-start;
      font-size:8px; font-weight:700; letter-spacing:0.06em;
      text-transform:var(--sc-text-transform,uppercase);
      padding:2px 6px; border-radius:4px;
      background:color-mix(in srgb,var(--sc-accent) 20%,rgba(0,0,0,0.5));
      color:var(--sc-accent);
      border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent);
      pointer-events:none;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;
    }


    /* ── Ambient effects gate ──────────────────────────────────────
       Applied when config.effects is off (the default). Disables purely
       decorative motion/glow; functional cues (alert blink, fan spin,
       explicit per-device icon animations) stay live. */
    .no-fx .dot.online { animation:none; box-shadow:none; }


    .no-fx .stat, .no-fx .cloud-chip { backdrop-filter:none; }

    .no-fx .tile:hover { transform:none; box-shadow:none; }
`,Xe=r`
/* ══════════════════════════════════════════════════════
       ALTERNATIVE TILE STYLES  (.ts-*)
       All use var(--ts-accent) injected inline per-tile.
       Colors fall back to --sc-* variables so themes apply.
    ══════════════════════════════════════════════════════ */

    /* ── Shared inner layout reset ── */
    .ts-hero,.ts-ring,.ts-hbar,.ts-spark,.ts-list {
      display:flex; flex-direction:column; gap:0; width:100%; height:100%;
    }


    /* ── STYLE: HERO NUMBER ─────────────────────────────── */
    .ts-hero-bar { height:2px; margin:-11px -13px 10px; background:var(--sc-tile-border); border-radius:var(--tile-radius) var(--tile-radius) 0 0; }

    .ts-hero-top { display:flex; align-items:center; justify-content:flex-start; gap:8px; margin-bottom:8px; }

    .ts-hero-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); line-height:1.3; flex:1; min-width:0; }

    .ts-hero-num  { font-size:2em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-hero-unit { font-size:.7em; color:var(--sc-text-muted); margin-top:2px; letter-spacing:.04em; }

    .ts-hero-spark { height:32px; margin:8px 0; }

    .ts-hero-foot { display:flex; align-items:center; justify-content:space-between; padding-top:6px; border-top:1px solid var(--sc-tile-border); margin-top:auto; }

    .ts-chips { display:flex; flex-wrap:wrap; gap:3px; }
    /* header_chips placement: ride the name row's spare width, right-aligned.
       The name elements are flex-basis 0, so without a cap the strip's content
       basis wins the whole row and the name collapses to nothing on narrow
       tiles — max-width guarantees the name keeps ~45% and the strip wraps
       inside its own share instead. */
    .ts-chips-hdr { margin-left:auto; justify-content:flex-end; min-width:0; flex:0 1 auto; max-width:55%; }
    /* Flex wrapper the compact variant puts around name + header chips:
       .ts-hbar-main is a block, so the strip needs a row of its own to ride. */
    .ts-hbar-namerow { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
    .ts-hbar-namerow .ts-hbar-name { flex:1; min-width:0; margin-bottom:0; }

    .ts-chip { font-size:var(--fs-sm); padding:2px 6px; border-radius:4px; background:var(--sc-sensor-bg); border:1px solid var(--sc-tile-border); color:var(--sc-text-muted); }
    /* A chip's identity is normally its unit — "60 lx" needs no caption. An
       entity named by id has no such tell, and two percentages side by side say
       nothing, so those chips carry a short name. Same rule as the block tile. */
    .ts-chip-lbl { opacity:.72; margin-right:3px; max-width:9em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:bottom; }

    .ts-uptime { font-size:var(--fs-sm); color:var(--sc-text-muted); white-space:nowrap; }


    /* ── STYLE: DONUT RING ──────────────────────────────── */
    .ts-ring-top  { display:flex; align-items:center; justify-content:flex-start; gap:8px; margin-bottom:4px; width:100%; }

    .ts-ring-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; }



    /* ── STYLE: HORIZONTAL SPLIT ────────────────────────── */
    .ts-hbar { padding:0; gap:0; }

    .ts-hbar-top  { display:flex; align-items:stretch; flex:1; }

    .ts-hbar-left-bar { width:3px; flex-shrink:0; border-radius:var(--tile-radius) 0 0 0; }

    .ts-hbar-main { flex:1; padding:11px 10px 8px 10px; min-width:0; }

    .ts-hbar-name { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); margin-bottom:4px; }

    .ts-hbar-num  { font-size:1.8em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-hbar-unit { font-size:.7em; color:var(--sc-text-muted); margin-top:2px; }

    .ts-hbar-side { width:62px; flex-shrink:0; border-left:1px solid var(--sc-tile-border); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:8px 4px; }

    .ts-hbar-sstat { text-align:center; }

    .ts-hbar-sk { font-size:var(--fs-xs); font-weight:600; letter-spacing:.03em; color:var(--sc-text-muted); }

    .ts-hbar-sv { font-size:.78em; color:var(--sc-text-secondary); margin-top:1px; }

    .ts-hbar-footer { display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border-top:1px solid var(--sc-tile-border); }

    .ts-hbar-badge { font-size:var(--fs-sm); padding:2px 7px; border-radius:4px; background:color-mix(in srgb,var(--ts-accent,var(--sc-accent)) 12%,transparent); color:var(--ts-accent,var(--sc-accent)); border:1px solid color-mix(in srgb,var(--ts-accent,var(--sc-accent)) 22%,transparent); }


    /* ── STYLE: SPARKLINE FOCUS ─────────────────────────── */
    .ts-spark-top    { display:flex; align-items:center; justify-content:flex-start; gap:8px; margin-bottom:6px; }

    .ts-spark-name   { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .ts-spark-graph  { margin:4px 0; }

    .ts-spark-bottom { display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto; padding-top:4px; }

    .ts-spark-big    { font-size:1.6em; font-weight:800; line-height:1; letter-spacing:-0.02em; }

    .ts-spark-sub    { font-size:var(--fs-sm); color:var(--sc-text-muted); margin-top:2px; }

    .ts-spark-meta   { text-align:right; }

    .ts-spark-mrow   { font-size:.72em; color:var(--sc-text-muted); margin-bottom:2px; }

    .ts-spark-mrow b { color:var(--sc-text-secondary); font-weight:500; }


    /* ── STYLE: LIST DENSE ──────────────────────────────── */
    .ts-list-header { display:flex; align-items:center; justify-content:flex-start; gap:8px; margin-bottom:8px; padding-bottom:7px; border-bottom:1px solid var(--sc-tile-border); }

    .ts-list-name   { display:flex; align-items:center; gap:5px; font-size:.82em; font-weight:700; color:var(--sc-text-primary); flex:1; min-width:0; }

    .ts-list-row    { display:flex; align-items:center; justify-content:space-between; padding:3px 0; border-bottom:1px solid rgba(255,255,255,.035); }

    .ts-list-row:last-of-type { border-bottom:none; }

    .ts-list-label  { font-size:.72em; color:var(--sc-text-muted); }

    .ts-list-val    { font-size:.72em; color:var(--sc-text-secondary); font-family:monospace; }

    .ts-list-spark  { margin-top:6px; padding-top:6px; border-top:1px solid var(--sc-tile-border); }


    /* ── Lower body shared by all alt tile styles ── */
    .ts-lower-body { display:flex; flex-direction:column; gap:0; margin-top:8px; padding-top:8px; border-top:1px solid var(--sc-tile-border); }

    .ts-lower-section { padding:6px 0 2px; }

    .ts-lower-section + .ts-lower-section { border-top:1px solid rgba(255,255,255,0.04); margin-top:4px; padding-top:6px; }

    /* Graphs inside lower body: use the existing sparklines-block styles */
    .ts-lower-graphs .sparklines-block { padding:0; }

    /* Dimmer inside lower body: reuse existing dim-row styles, no extra padding needed */
    .ts-lower-dimmer .tile-dim-row { margin-bottom:4px; }

    /* TRV, valve, cover: these have their own internal padding already */
    .ts-lower-trv .tile-trv-dial,
    .ts-lower-valve .tile-trv-dial { padding:0; }

    /* Relay channels */
    .ts-lower-relay .relay-channels { padding:0; }


    /* ── LIGHT CONTROL ── */
    .ts-light { display:flex;flex-direction:column;gap:6px;width:100% }

    .ts-light-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px }

    .ts-light-name { display:flex;align-items:center;gap:5px;font-size:.82em;font-weight:700;color:var(--sc-text-primary);flex:1;min-width:0 }

    .ts-light-wheel-wrap { display:flex;justify-content:center;margin:4px 0; border-radius:50%; }

    .ts-light-wheel-wrap.ts-wheel-pulse { animation: ts-wheel-pulse 360ms ease-out; }

    .ts-light-wheel { border-radius:50%;display:block }

    .ts-light-row { display:flex;align-items:center;gap:8px }

    .ts-light-lbl { font-size:var(--fs-xs);color:var(--sc-text-muted);width:52px;flex-shrink:0;letter-spacing:.02em }

    .ts-light-pct { font-size:.72em;color:var(--sc-text-secondary);width:36px;text-align:right;flex-shrink:0 }

    .ts-light-slider { accent-color:var(--ts-accent,var(--sc-accent));flex:1 }

    .ts-light-ct { background:linear-gradient(to right,#ff9a3c,white,#c9e8ff) }


    /* ── CLIMATE CONTROL ── */
    .ts-climate { display:flex;flex-direction:column;align-items:center;gap:4px;width:100% }

    .ts-climate-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;width:100% }


    /* ── COVER CONTROL ── */
    .ts-cover { display:flex;flex-direction:column;gap:8px;width:100% }

    .ts-cover-top { display:flex;align-items:center;justify-content:space-between }

    .ts-cover-pct { font-size:1.2em;font-weight:800;line-height:1 }

    .ts-cover-graphic { position:relative;color:var(--sc-text-primary) }

    .ts-cover-state { position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:var(--fs-xs);color:var(--sc-text-muted);white-space:nowrap }

    .ts-cover-btns { display:flex;gap:6px }
    .ts-cover-slider { width:100%;margin:6px 0 0;accent-color:var(--ts-accent,var(--sc-accent));cursor:pointer }

    .ts-cover-btn { flex:1;padding:8px 0;border-radius:8px;border:1px solid var(--sc-tile-border);background:rgba(255,255,255,.05);color:var(--sc-text-primary);font-size:14px;cursor:pointer;transition:all .15s;text-align:center }

    .ts-cover-btn:hover { background:rgba(255,255,255,.12);border-color:var(--sc-accent) }

    .ts-cover-stop { color:var(--sc-text-muted);font-size:11px }


    /* ── SENSOR CARD ── */
    .ts-sensor { display:flex;flex-direction:column;gap:4px;width:100% }

    .ts-sensor-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:2px }

    .ts-sensor-dc { font-size:var(--fs-xs);font-weight:600;letter-spacing:.03em;color:var(--sc-text-muted) }

    .ts-sensor-main { display:flex;align-items:baseline;gap:4px }

    .ts-sensor-val { font-size:2.4em;font-weight:800;line-height:1;letter-spacing:-.02em }

    .ts-sensor-unit { font-size:.9em;color:var(--sc-text-muted) }

    .ts-sensor-trend { font-size:.72em;font-weight:600;padding:2px 8px;border-radius:10px;display:inline-block;margin-top:2px }

    .ts-sensor-trend.up { background:rgba(56,217,192,.15);color:#38d9c0;border:1px solid rgba(56,217,192,.25) }

    .ts-sensor-trend.down { background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.2) }

    .ts-sensor-spark { margin:4px 0 }

    .ts-sensor-binary-state { display:flex;align-items:center;gap:8px;font-size:1.1em;font-weight:700;margin:8px 0 }

    .ts-sensor-binary-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0 }


    /* ── SCENE BUTTON ── */
    /* ── input-control: the i3/i4 keypad ── */
    .ts-inputs { display:flex;flex-direction:column;gap:8px;width:100% }
    .ts-inputs-top { display:flex;align-items:center;justify-content:space-between }
    .ts-inputs-empty { font-size:var(--fs-sm);color:var(--sc-text-muted) }
    /* Rows for unassigned channels sit under the keys, visually demoted. */
    .ts-inputs-rest { padding-top:6px;border-top:1px solid rgba(255,255,255,.07);opacity:.85 }
    .ts-keys { display:grid;grid-template-columns:repeat(var(--keys,2),1fr);gap:6px }
    /* Chips sit under the keypad so a key's grid cell never grows taller than
       its neighbour's and drags the following row out of alignment. */
    .ts-key-chips { display:flex;flex-wrap:wrap;align-items:center;gap:6px }
    .ts-key-chip-lbl { font-size:11px;font-weight:600;color:var(--sc-text-secondary) }
    .ts-key-chips .input-sel { flex:1;min-width:0;max-width:none }
    .ts-key { position:relative;min-width:0;display:flex;flex-direction:column;align-items:flex-start;
      gap:2px;width:100%;min-height:54px;padding:8px 10px;border-radius:12px;cursor:pointer;
      font:inherit;text-align:left;overflow:hidden;
      background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);
      color:var(--sc-text-primary);transition:background .15s,border-color .15s,transform .08s }
    .ts-key:hover { background:rgba(255,255,255,.10) }
    .ts-key:active { transform:scale(.97) }
    /* Holding must not scroll the dashboard or select the label. */
    .ts-key.holdable { touch-action:none;user-select:none;-webkit-user-select:none }
    .ts-key-label { font-size:13px;font-weight:700;line-height:1.15;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100% }
    .ts-key-dim { color:var(--ts-accent);font-weight:700;font-variant-numeric:tabular-nums }
    .ts-key-sub { font-size:11px;color:var(--sc-text-secondary);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100% }
    .ts-key-age { font-size:10px;color:var(--sc-text-muted) }
    .ts-key-pip { position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;
      background:var(--sc-text-muted);opacity:.5;transition:background .15s,opacity .15s }
    /* Lit: the key's toggle target is on. */
    .ts-key.is-on { background:color-mix(in srgb,var(--ts-accent) 20%,transparent);
      border-color:color-mix(in srgb,var(--ts-accent) 45%,transparent) }
    .ts-key.is-on .ts-key-pip { background:var(--ts-accent);opacity:1;
      box-shadow:0 0 6px var(--ts-accent) }
    .ts-key.is-on:hover { background:color-mix(in srgb,var(--ts-accent) 30%,transparent) }
    /* Target offline — say so rather than showing a confident "off". */
    .ts-key.is-unavailable { opacity:.55;border-style:dashed }
    .ts-key.is-unavailable .ts-key-pip { background:var(--sc-offline-color,#f87171);opacity:.8 }
    /* Neutral: the action isn't a toggle, so there is no state to claim. */
    .ts-key.is-neutral .ts-key-pip { display:none }

    .ts-scene { display:flex;flex-direction:column;gap:6px;width:100% }

    .ts-scene-top { display:flex;align-items:center;justify-content:space-between }

    .ts-scene-centered { align-items:center;justify-content:center;min-height:120px;position:relative;cursor:pointer;user-select:none }

    .ts-scene-icon-wrap { width:calc(48px * var(--ent-size, 1));height:calc(48px * var(--ent-size, 1));display:flex;align-items:center;justify-content:center;margin-bottom:6px }

    .ts-scene-icon-wrap .ts-scene-icon { width:100%;height:100% }

    .ts-scene-name { font-size:.9em;font-weight:700;color:var(--sc-text-primary);text-align:center }

    .ts-scene-time { font-size:var(--fs-sm);color:var(--sc-text-muted) }

    .ts-scene-ripple { position:absolute;inset:0;border-radius:inherit;pointer-events:none }

    .ts-scene-ripple.active { animation:scene-ripple .5s ease-out forwards }

    @keyframes ts-wheel-pulse { 0% { box-shadow:0 0 0 0 var(--sc-accent); } 100% { box-shadow:0 0 0 10px transparent; } }

    @keyframes scene-ripple { 0%{box-shadow:inset 0 0 0 0 rgba(255,255,255,.2)} 100%{box-shadow:inset 0 0 0 60px rgba(255,255,255,0)} }
`,Qe=r`
    /* ══════════════════════════════════════════════════════
         DETAIL SHEET  (.ds-*)
         Modal that opens on short tap of tile icon/name area.
         Uses --ds-accent injected per-device.
      ══════════════════════════════════════════════════════ */

    .ds-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, .55);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      animation: ds-fade-in .15s ease-out;
    }
    @keyframes ds-fade-in { from { opacity: 0 } to { opacity: 1 } }

    .ds-sheet {
      width: min(640px, 92vw); max-height: 88vh; overflow-y: auto;
      background: var(--sc-card-bg, #1c1c1e);
      border: 1px solid var(--sc-tile-border);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
      display: flex; flex-direction: column;
      animation: ds-slide-up .2s ease-out;
    }
    @keyframes ds-slide-up {
      from { opacity: 0; transform: translateY(12px) }
      to   { opacity: 1; transform: translateY(0) }
    }

    /* ── confirm_off prompt (.cf-*) ──────────────────────────────────────
         Sits above the detail sheet: a turn-off can be started from inside it,
         and the question must not open behind the thing that asked. */
    .cf-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, .6);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      animation: ds-fade-in .12s ease-out;
    }
    .cf-box {
      width: min(340px, 88vw);
      background: var(--sc-card-bg, #1c1c1e);
      border: 1px solid var(--sc-tile-border);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
      padding: 20px 18px 16px;
      text-align: center;
      animation: ds-slide-up .18s ease-out;
    }
    .cf-title {
      font-size: 1.05em; font-weight: 700; color: var(--sc-text-primary);
      margin-bottom: 6px; overflow-wrap: anywhere;
    }
    .cf-sub { font-size: .78em; color: var(--sc-text-muted); margin-bottom: 16px; }
    .cf-actions { display: flex; gap: 8px; }
    .cf-actions button {
      padding: 10px 14px; border-radius: 10px; cursor: pointer;
      font-size: .86em; font-weight: 700; transition: all .15s;
    }
    /* Cancel is the wide one and the destructive button the narrow one, so the
       reflex press on a prompt you did not expect is the harmless one. */
    .cf-cancel {
      flex: 2;
      background: rgba(255, 255, 255, .08); border: 1px solid var(--sc-tile-border);
      color: var(--sc-text-primary);
    }
    .cf-cancel:hover { background: rgba(255, 255, 255, .16); }
    .cf-go {
      flex: 1;
      background: rgba(239, 68, 68, .18); border: 1px solid rgba(239, 68, 68, .4);
      color: #fca5a5;
    }
    .cf-go:hover { background: rgba(239, 68, 68, .3); color: #fff; }

    .ds-header {
      position: relative;
      padding: 18px 18px 12px;
      border-bottom: 1px solid var(--sc-tile-border);
    }
    .ds-header-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .ds-header-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .ds-device-name {
      font-size: 1.15em; font-weight: 700; color: var(--sc-text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .ds-close {
      background: rgba(255, 255, 255, .06); border: none; color: var(--sc-text-secondary);
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      font-size: 14px; line-height: 1; transition: all .15s;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ds-close:hover { background: rgba(255, 255, 255, .14); color: var(--sc-text-primary); }

    .ds-header-meta { display: flex; flex-wrap: wrap; gap: 5px; }

    .ds-chip {
      font-size: .72em; font-weight: 600; letter-spacing: .03em;
      padding: 3px 9px; border-radius: 12px;
      background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .08);
      color: var(--sc-text-secondary);
    }
    .ds-chip--room { background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 16%, transparent); color: var(--ds-accent, var(--sc-accent)); border-color: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 26%, transparent); }
    .ds-chip--type { background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 10%, transparent); color: var(--sc-text-primary); }
    .ds-chip--on    { background: rgba(74, 222, 128, .16); color: var(--sc-online-color); border-color: rgba(74, 222, 128, .28); }
    .ds-chip--alert { background: rgba(239, 68, 68, .18);  color: #fca5a5; border-color: rgba(239, 68, 68, .28); animation: blink 1.4s step-end infinite; }

    .ds-fw-install { margin-left:auto; padding:3px 10px; border-radius:6px; border:1px solid var(--sc-accent); background:transparent; color:var(--sc-accent); font-size:.78em; font-weight:600; cursor:pointer; }
    .ds-fw-install:hover { background:var(--sc-accent); color:#fff; }
    .ds-fw-update {
      margin-top: 8px; font-size: .78em; color: var(--sc-update-color);
      padding: 4px 8px; background: rgba(245, 158, 11, .14); border-radius: 6px;
      display: inline-block;
    }
    .ds-signal { margin-top: 6px; font-size: .74em; color: var(--sc-text-muted); }
    .ds-accent-bar {
      position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
      opacity: .8;
    }

    .ds-body { padding: 14px 18px 20px; display: flex; flex-direction: column; gap: 14px; }

    .ds-section {
      padding: 12px 14px;
      background: rgba(255, 255, 255, .03);
      border: 1px solid var(--sc-tile-border);
      border-radius: 10px;
    }
    .ds-section-title {
      font-size: .72em; font-weight: 700; letter-spacing: .08em;
      color: var(--sc-text-muted); text-transform: uppercase;
      margin-bottom: 10px;
    }
    /* Sub-heading for the config / diagnostic tiers within the All-Entities list */
    .ds-ent-subgroup {
      font-size: .64em; font-weight: 600; letter-spacing: .07em;
      color: var(--sc-text-muted); text-transform: uppercase; opacity: .75;
      margin: 12px 0 6px;
    }
    /* Config/diagnostic rows read as secondary to the primary controls above */
    .ds-entity-row.is-secondary { opacity: .7; }
    .ds-section .sparklines-block { padding: 0; margin: 0; }

    .ds-single-toggle { display: flex; justify-content: center; padding: 20px; }
    .ds-big-toggle { font-size: 1.1em; padding: 12px 32px; border-radius: 24px; }

    .ds-plug-hero {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      padding: 18px;
    }
    .ds-big-power { font-size: 1.8em; font-weight: 800; color: var(--sc-power-color); font-variant-numeric: tabular-nums; }

    .ds-dimmer-control { display: flex; align-items: center; gap: 12px; }
    .ds-dimmer-pct { font-size: 1em; font-weight: 700; color: var(--sc-text-primary); width: 44px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
    .ds-slider { flex: 1; min-width: 0; accent-color: var(--ds-accent, var(--sc-accent)); }

    .ds-color-swatch {
      margin-top: 10px; width: 100%; height: 28px; border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, .1);
    }

    .ds-sensor-hero {
      display: flex; flex-direction: column; align-items: center;
      padding: 18px; gap: 4px;
    }
    .ds-big-value { font-size: 2.6em; font-weight: 800; color: var(--sc-text-primary); line-height: 1; font-variant-numeric: tabular-nums; }
    .ds-big-unit  { font-size: .9em; color: var(--sc-text-muted); letter-spacing: .04em; }

    .ds-alert-row { display: flex; flex-wrap: wrap; gap: 6px; }

    .ds-sensor-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;
    }
    .ds-sensor-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 4px; background: rgba(255, 255, 255, .04); border-radius: 6px;
    }
    .ds-sensor-val { font-size: .95em; font-weight: 700; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; }
    .ds-sensor-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; margin-top: 2px; }

    .ds-diag-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px;
    }
    .ds-diag-item { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; background: rgba(255, 255, 255, .04); border-radius: 6px; }
    .ds-diag-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; }
    .ds-diag-val { font-size: .85em; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ds-diag-alert .ds-diag-val { color: #fca5a5; }

    .ds-channel-list { display: flex; flex-direction: column; gap: 4px; }
    .ds-channel-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      background: rgba(255, 255, 255, .03); border-radius: 6px;
    }
    .ds-channel-name { flex: 1; font-size: .88em; color: var(--sc-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .ds-channel-power { font-size: .82em; color: var(--sc-power-color); font-variant-numeric: tabular-nums; flex-shrink: 0; }

    .ds-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .ds-tab {
      background: rgba(255, 255, 255, .04); border: 1px solid var(--sc-tile-border);
      color: var(--sc-text-secondary); padding: 4px 12px; border-radius: 8px;
      font-size: .78em; font-weight: 600; cursor: pointer; transition: all .15s;
    }
    .ds-tab:hover { background: rgba(255, 255, 255, .08); color: var(--sc-text-primary); }
    .ds-tab--active {
      background: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 18%, transparent);
      border-color: color-mix(in srgb, var(--ds-accent, var(--sc-accent)) 36%, transparent);
      color: var(--ds-accent, var(--sc-accent));
    }

    .ds-entity-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      background: rgba(255, 255, 255, .03); border-radius: 6px; cursor: pointer;
      transition: background .12s;
    }
    .ds-entity-row:hover { background: rgba(255, 255, 255, .06); }
    .ds-entity-row + .ds-entity-row { margin-top: 4px; }
    .ds-ent-icon { font-size: 1em; width: 20px; text-align: center; flex-shrink: 0; color: var(--sc-text-muted); }
    .ds-ent-name { flex: 1; font-size: .85em; color: var(--sc-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .ds-ent-state { font-size: .82em; color: var(--sc-text-secondary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
    .ds-ent-age { font-size: .7em; color: var(--sc-text-muted); flex-shrink: 0; }

    .ds-climate-info { display: flex; justify-content: space-around; align-items: center; gap: 14px; padding: 6px 0; }
    .ds-climate-current, .ds-climate-target { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .ds-climate-target { flex-direction: row; gap: 8px; }
    .ds-climate-label { font-size: var(--fs-xs); color: var(--sc-text-muted); letter-spacing: .02em; }
    .ds-climate-val { font-size: 1.3em; font-weight: 700; color: var(--sc-text-primary); font-variant-numeric: tabular-nums; }
    .ds-climate-target-val { font-size: 1.5em; color: var(--ds-accent, var(--sc-accent)); min-width: 80px; text-align: center; }
    .ds-temp-btn {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--sc-tile-border);
      background: rgba(255, 255, 255, .05); color: var(--sc-text-primary); cursor: pointer;
      font-size: 1.2em; font-weight: 700; transition: all .15s;
    }
    .ds-temp-btn:hover { background: rgba(255, 255, 255, .12); border-color: var(--ds-accent, var(--sc-accent)); }
    .ds-climate-modes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .ds-valve-pos { margin-top: 8px; font-size: .82em; color: var(--sc-text-muted); }

    .ds-cover-controls { display: flex; gap: 6px; justify-content: center; margin-bottom: 10px; }
    .ds-cover-btn {
      flex: 1; max-width: 110px; padding: 9px 12px; border-radius: 8px;
      border: 1px solid var(--sc-tile-border); background: rgba(255, 255, 255, .05);
      color: var(--sc-text-primary); font-size: .82em; font-weight: 600; cursor: pointer;
      transition: all .15s;
    }
    .ds-cover-btn:hover { background: rgba(255, 255, 255, .12); border-color: var(--ds-accent, var(--sc-accent)); }
    .ds-cover-pos { font-size: .82em; color: var(--sc-text-muted); margin: 4px 0; }

    .ds-muted { color: var(--sc-text-muted); font-size: .85em; }
`,Ze={en:{"chip.power":"Power","chip.apparent_power":"App.P","chip.reactive_power":"Re.P","chip.power_factor":"PF","chip.frequency":"Freq","chip.voltage":"Volt","chip.current":"Curr","chip.temperature":"Temp","chip.humidity":"Hum","chip.illuminance":"Light","chip.gas":"Gas","chip.battery":"Batt","chip.rssi":"Wi-Fi","chip.uptime":"Up","chip.motion":"Motion","chip.door":"Door","chip.flood":"Flood","chip.smoke":"Smoke","chip.vibration":"Vibr","chip.overtemp":"Overtemp","chip.overpower":"Overpower","chip.cloud":"Cloud","chip.ethernet":"Ethernet","chip.valve":"Valve","chip.battery_short":"Batt","state.clear":"Clear","state.ok":"OK","state.open":"Open","state.closed":"Closed","state.dry":"Dry","state.motion":"Motion","state.flooded":"Flooded","state.smoke":"Smoke!","state.gas":"Gas!","state.vibrating":"Vibrating","state.overtemp":"Overtemp!","state.overpower":"Overpower!","state.connected":"Connected","state.offline":"Offline","state.opening":"Opening…","state.closing":"Closing…","state.partial":"Partial","media.playing":"Playing","media.paused":"Paused","media.idle":"Idle","media.unavailable":"Unavailable","media.off":"Off","media.default_group":"Media","media.station":"Station…","media.loading":"Loading…","energy.total":"Energy","energy.today":"Today","energy.week":"Week","energy.month":"Month","time.never":"Never","time.just_now":"Just now","time.minutes_ago":"{n}m ago","time.hours_ago":"{n}h ago","time.days_ago":"{n}d ago","header.favourites":"Favourites","header.no_area":"No Area","header.needs_attention":"Needs attention","header.expand_all":"Expand all","header.collapse_all":"Collapse all","header.expand_every_room":"Expand every room","header.collapse_every_room":"Collapse every room","header.firmware":"Firmware","header.firmware_versions":"{n} firmware versions","header.newest":"newest","action.turn_on":"Turn on","action.turn_off":"Turn off","action.cancel":"Cancel","action.open":"Open","action.close":"Close","action.play":"Play","action.pause":"Pause","action.mute":"Mute","action.unmute":"Unmute","action.install":"Install","action.show_history":"Show history","action.dismiss":"Dismiss","action.heat":"HEAT","action.off":"OFF","confirm.aria":"Confirm turn off","confirm.title":"Turn off {name}?","confirm.body":"This device is set to ask before switching off.","tile.brightness":"Brightness","tile.color_temp":"Temp","tile.white":"White","tile.valve":"Valve","tile.press":"Press","tile.idle":"Idle","pm.power":"Power","pm.voltage":"Voltage","pm.current":"Current","pm.temperature":"Temp","pm.rssi":"WiFi","pm.uptime":"Uptime","pm.energy":"Energy","action.previous":"Previous","action.stop":"Stop","action.next":"Next","media.no_favourites":"No favourites — star stations on the display","media.volume":"Volume {n}%","state.on_short":"ON","state.off_short":"OFF","tile.now":"Now","tile.set":"Set","tile.heating":"Heating","pm.watts":"watts","state.active":"active","state.idle_low":"idle","detail.valve_pos":"Valve: {n}%","detail.signal":"Wi-Fi: {quality} ({dbm} dBm)","detail.uptime_inline":"Up {value}","profile.relay":"Relay","profile.plug":"Plug","profile.dimmer":"Dimmer","profile.rgb":"RGB","profile.climate":"TRV","profile.cover":"Roller","profile.valve":"Valve","profile.lock":"Lock","profile.media":"Media","profile.energy":"Energy","profile.sensor":"Sensor","profile.input":"Input","profile.uni":"UNI","profile.wall_display":"Display","graph.power":"Power","graph.voltage":"Voltage","graph.current":"Current","graph.energy":"Energy","graph.apparent_power":"App.","graph.reactive_power":"React.","graph.frequency":"Frequency","graph.power_factor":"Power","graph.temperature":"Temperature","graph.humidity":"Humidity","graph.illuminance":"Illuminance","graph.carbon_dioxide":"CO₂","graph.gas":"Gas","graph.battery":"Battery","graph.signal_strength":"RSSI","empty.no_climate":"No climate entity","empty.no_cover":"No cover entity","empty.no_valve":"No valve entity","empty.no_light":"No light entity","empty.no_sensor":"No sensor","empty.no_inputs":"No input channels","empty.no_gauge_readings":"No readings to gauge","detail.all_entities":"All Entities","detail.configuration":"Configuration","detail.diagnostic":"Diagnostic","detail.diagnostics":"Diagnostics","detail.sensors":"Sensors","detail.alerts":"Alerts","detail.rssi":"RSSI","detail.uptime":"Uptime","detail.firmware":"Firmware","detail.relay_channels":"Relay Channels","detail.light_controls":"Light Controls","detail.input_channels":"Input Channels","detail.adc_inputs":"ADC Inputs","detail.outputs":"Outputs","detail.controls":"Controls","detail.climate":"Climate","detail.cover":"Cover","detail.valve":"Valve","detail.brightness":"Brightness","detail.sensor_current":"Current","detail.sensor_power":"Power","detail.sensor_voltage":"Voltage","detail.sensor_temp":"Temp","detail.climate_current":"Current","detail.fw_update":"FW update: {from} → {to}","detail.install_now":"Install {version} now","picker.title":"HA Device Dashboard","picker.subtitle":"Add the card to configure rooms and devices","notice.native_controls":"Native controls","notice.delegate_one":"{n} device has extra controls (fan, vacuum, lock…). Turn on","notice.delegate_many":"{n} devices have extra controls (fan, vacuum, lock…). Turn on","notice.delegate_here":"to show them.","notice.delegate_editor":"in the editor to show them.","notice.discovery_shelly":"{n} more devices are in Home Assistant but not on this card — it is in Shelly mode.","notice.discovery_hidden":"{n} devices are not shown:","notice.hidden_integration":"{n} by integration","notice.hidden_scope":"{n} by scope","notice.hidden_domain":"{n} by domain","notice.discovery_link":"Discovery","notice.discovery_here":"has the settings.","notice.discovery_editor":"in the editor has the settings.","error.replay_needs_admin":"Replaying a press needs an admin login — Home Assistant refused the event"},is:{"chip.power":"Afl","chip.apparent_power":"S.afl","chip.reactive_power":"L.afl","chip.power_factor":"Afls.","chip.frequency":"Tíðni","chip.voltage":"Spenna","chip.current":"Str.","chip.temperature":"Hiti","chip.humidity":"Raki","chip.illuminance":"Birta","chip.gas":"Gas","chip.battery":"Rafh.","chip.rssi":"Wi-Fi","chip.uptime":"Uppi","chip.motion":"Hreyf.","chip.door":"Hurð","chip.flood":"Vatn","chip.smoke":"Reykur","chip.vibration":"Titr.","chip.overtemp":"Ofhiti","chip.overpower":"Ofálag","chip.cloud":"Ský","chip.ethernet":"Ethernet","chip.valve":"Loki","chip.battery_short":"Rafh.","state.clear":"Í lagi","state.ok":"Í lagi","state.open":"Opið","state.closed":"Lokað","state.dry":"Þurrt","state.motion":"Hreyfing","state.flooded":"Vatn!","state.smoke":"Reykur!","state.gas":"Gas!","state.vibrating":"Titrar","state.overtemp":"Ofhiti!","state.overpower":"Ofálag!","state.connected":"Tengt","state.offline":"Ótengt","state.opening":"Opnast…","state.closing":"Lokast…","state.partial":"Að hluta","media.playing":"Spilar","media.paused":"Í hléi","media.idle":"Bið","media.unavailable":"Ótiltækt","media.off":"Slökkt","media.default_group":"Efni","media.station":"Stöð…","media.loading":"Hleð…","energy.total":"Orka","energy.today":"Í dag","energy.week":"Vika","energy.month":"Mánuður","time.never":"Aldrei","time.just_now":"Rétt í þessu","time.minutes_ago":"fyrir {n} mín","time.hours_ago":"fyrir {n} klst","time.days_ago":"fyrir {n} d","header.favourites":"Eftirlæti","header.no_area":"Ekkert svæði","header.needs_attention":"Þarfnast athygli","header.expand_all":"Opna allt","header.collapse_all":"Loka öllu","header.expand_every_room":"Opna öll herbergi","header.collapse_every_room":"Loka öllum herbergjum","header.firmware":"Fastbúnaður","header.firmware_versions":"{n} fastbúnaðarútgáfur","header.newest":"nýjast","action.turn_on":"Kveikja","action.turn_off":"Slökkva","action.cancel":"Hætta við","action.open":"Opna","action.close":"Loka","action.play":"Spila","action.pause":"Hlé","action.mute":"Þagga","action.unmute":"Afþagga","action.install":"Setja upp","action.show_history":"Sýna sögu","action.dismiss":"Loka","action.heat":"HITA","action.off":"SLÖKKT","confirm.aria":"Staðfesta slökkvun","confirm.title":"Slökkva á {name}?","confirm.body":"Þetta tæki er stillt á að spyrja áður en slökkt er.","tile.brightness":"Birtustig","tile.color_temp":"Hiti","tile.white":"Hvítt","tile.valve":"Loki","tile.press":"Ýting","tile.idle":"Bið","pm.power":"Afl","pm.voltage":"Spenna","pm.current":"Straumur","pm.temperature":"Hiti","pm.rssi":"WiFi","pm.uptime":"Keyrslutími","pm.energy":"Orka","action.previous":"Fyrra","action.stop":"Stöðva","action.next":"Næsta","media.no_favourites":"Engin eftirlæti — stjörnumerktu stöðvar á skjánum","media.volume":"Hljóðstyrkur {n}%","state.on_short":"Á","state.off_short":"AF","tile.now":"Núna","tile.set":"Stillt","tile.heating":"Hitar","pm.watts":"vött","state.active":"virkt","state.idle_low":"óvirkt","detail.valve_pos":"Loki: {n}%","detail.signal":"Wi-Fi: {quality} ({dbm} dBm)","detail.uptime_inline":"Uppi {value}","profile.relay":"Liði","profile.plug":"Tengill","profile.dimmer":"Deyfir","profile.rgb":"RGB","profile.climate":"Ofnloki","profile.cover":"Hleri","profile.valve":"Loki","profile.lock":"Lás","profile.media":"Spilari","profile.energy":"Orka","profile.sensor":"Skynjari","profile.input":"Inntak","profile.uni":"UNI","profile.wall_display":"Skjár","graph.power":"Afl","graph.voltage":"Spenna","graph.current":"Straumur","graph.energy":"Orka","graph.apparent_power":"Sýndarafl","graph.reactive_power":"Launafl","graph.frequency":"Tíðni","graph.power_factor":"Aflstuðull","graph.temperature":"Hitastig","graph.humidity":"Raki","graph.illuminance":"Birta","graph.carbon_dioxide":"CO₂","graph.gas":"Gas","graph.battery":"Rafhlaða","graph.signal_strength":"RSSI","empty.no_climate":"Engin hitastýring","empty.no_cover":"Enginn hleri","empty.no_valve":"Enginn loki","empty.no_light":"Ekkert ljós","empty.no_sensor":"Enginn skynjari","empty.no_inputs":"Engar inntaksrásir","empty.no_gauge_readings":"Engar mælingar","detail.all_entities":"Allar einingar","detail.configuration":"Stillingar","detail.diagnostic":"Greining","detail.diagnostics":"Greiningar","detail.sensors":"Skynjarar","detail.alerts":"Viðvaranir","detail.rssi":"RSSI","detail.uptime":"Keyrslutími","detail.firmware":"Fastbúnaður","detail.relay_channels":"Liðarásir","detail.light_controls":"Ljósastýringar","detail.input_channels":"Inntaksrásir","detail.adc_inputs":"ADC inntök","detail.outputs":"Úttök","detail.controls":"Stýringar","detail.climate":"Hitastýring","detail.cover":"Hleri","detail.valve":"Loki","detail.brightness":"Birtustig","detail.sensor_current":"Straumur","detail.sensor_power":"Afl","detail.sensor_voltage":"Spenna","detail.sensor_temp":"Hiti","detail.climate_current":"Núna","detail.fw_update":"Uppfærsla: {from} → {to}","detail.install_now":"Setja upp {version} núna","picker.title":"HA Device Dashboard","picker.subtitle":"Bættu kortinu við til að stilla herbergi og tæki","notice.native_controls":"Innbyggðar stýringar","notice.delegate_one":"{n} tæki er með auka stýringar (vifta, ryksuga, lás…). Kveiktu á","notice.delegate_many":"{n} tæki eru með auka stýringar (vifta, ryksuga, lás…). Kveiktu á","notice.delegate_here":"til að sýna þær.","notice.delegate_editor":"í ritlinum til að sýna þær.","notice.discovery_shelly":"{n} tæki til viðbótar eru í Home Assistant en ekki á þessu korti — það er í Shelly-ham.","notice.discovery_hidden":"{n} tæki eru ekki sýnd:","notice.hidden_integration":"{n} vegna samþættingar","notice.hidden_scope":"{n} vegna umfangs","notice.hidden_domain":"{n} vegna léns","notice.discovery_link":"Uppgötvun","notice.discovery_here":"geymir stillingarnar.","notice.discovery_editor":"í ritlinum geymir stillingarnar.","error.replay_needs_admin":"Endurtekning á ýtingu krefst stjórnandaaðgangs — Home Assistant hafnaði viðburðinum"}},Je="en";function et(e){if(!e)return Je;const t=e.toLowerCase();if(Ze[t])return t;const i=t.split("-")[0];return Ze[i]?i:Je}let tt=Je;function it(e,t){return function(e,t,i){const s=et(e),o=Ze[s]?.[t]??Ze[Je][t]??t;return i?o.replace(/\{(\w+)\}/g,(e,t)=>t in i?String(i[t]):e):o}(tt,e,t)}function st(e,t){const i=it(e);return i===e?t:i}function ot(e){return e.showEl("header_chips")&&e.showEl("secondary")}function at(e,t,i="ts-hero-name"){return q`
    <div class="${i} tile-trigger">
      <span class="dot ${t?"online":"offline"}"></span>${e.name}
    </div>`}function nt(e,t,i,s){return q`
    <div class="${i}">
      ${at(e,t)}
      <span style="color:var(--sc-text-muted);font-size:.8em">${s}</span>
    </div>`}function rt(e,t,i){const s=null!=e.getInputActionLabel(t,i),o="button"===i.kind?i.lastEvent?i.lastEvent.replace(/_/g," "):"no press yet":i.isOn?"On":"Off",a=s?void 0:t=>{t.stopPropagation(),e.fireMoreInfo(i.entityId)};return q`
    <div class="input-row ${"button"===i.kind?"btn-mode":"sw-mode"} ${i.isOn?"active":""} ${a?"tappable":""}"
      title=${a?it("action.show_history"):""} @click=${a}>
      <span class="${"button"===i.kind?"input-btn-dot":"input-row-dot"}"></span>
      <span class="input-row-name">${i.label}</span>
      <span class="input-row-event ${"switch"===i.kind?i.isOn?"is-on":"is-off":""}">${o}</span>
      <span class="input-row-time">${e.timeAgo(i.lastChanged)}</span>
      <span class="input-row-act">${function(e,t,i){const s=e.getInputActionLabel(t,i),o=e.getInputSelectChip(t,i);if(!s)return o?lt(e,o):Y;const a=e.inputHasHold(t,i),n=()=>e.endInputHold(),r=e.getInputDimFeedback(i);return q`
    <button class="input-act ${a?"holdable":""} ${r?"dimming":""}"
      title=${a?`${s} — hold to dim`:s}
      @click=${s=>e.runInputAction(t,i,s)}
      @pointerdown=${s=>e.startInputHold(t,i,s)}
      @pointerup=${n} @pointerleave=${n} @pointercancel=${n}
      >${r?`${r.dir>0?"▲":"▼"} ${r.pct}%`:s}</button>
    ${o?lt(e,o):Y}`}(e,t,i)}</span>
    </div>`}function lt(e,t){return q`
    <select class="input-sel" title=${t.label??t.entity}
      @click=${e=>e.stopPropagation()}
      @pointerdown=${e=>e.stopPropagation()}
      @change=${i=>{i.stopPropagation(),e.setInputSelectOption(t.entity,i.target.value)}}>
      ${t.options.map(e=>q`
        <option value=${e} ?selected=${e===t.current}>${t.label?`${t.label}: ${e}`:e}</option>`)}
    </select>`}const ct=/^\s*[♪♫♬♩]\s*/,dt=new Set(["pixels","pixelwave","juggles","matripix","gravimeter","plasmoid","puddles","midnoise","noisemeter","freqwave","freqmatrix","geq","waterfall","freqpixels","noisefire","puddlepeak","noisemove","ripple peak","freqmap","gravcenter","gravcentric","gravfreq","dj light","funky plank","blurz","waverly","swirl","rocktaves","akemi","ps spray","ps geq 2d","ps geq nova","ps blobs","ps geq 1d","ps sonic stream","ps sonic boom","ps springy"]),pt=e=>ct.test(e)||dt.has(e.replace(ct,"").trim().toLowerCase());function ht(e,t,i){if(e.length<=1)return Y;const s=e.filter(pt),o=e.filter(e=>!pt(e)&&"Off"!==e),a=e.find(e=>"Off"===e)??e.find(e=>"Solid"===e),n=e=>q`
    <option value=${e} ?selected=${t===e}>${e}</option>`;return q`
    <div class="tile-effects" @click=${e=>e.stopPropagation()}>
      <select class="effect-sel"
        @pointerdown=${e=>e.stopPropagation()}
        @change=${e=>{e.stopPropagation(),i(e.target.value)}}>
        ${a?q`
          <option value=${a} ?selected=${!t||t===a}>— no effect —</option>`:Y}
        ${s.length?q`
          <optgroup label="Sound reactive">${s.map(n)}</optgroup>`:Y}
        <optgroup label="Effects">${o.filter(e=>e!==a).map(n)}</optgroup>
      </select>
    </div>`}const ut={comfort:"🏠",eco:"🌿",boost:"🚀",away:"🌙",none:"❄️"};const gt=[3,7,11,15,19,23,27];function vt(e,t,i,s){if("none"===e)return q``;const o=t?"on":"off";if("flame"===e)return q`${G`<svg class="${s} ent-icon-flame ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="flame-main" d="M10 17 C6 17 4 14 4 11 C4 8 6 6 8 4 C8 7 9 8 10 8 C11 8 11 7 11 6 C13 8 16 10 16 13 C16 16 13.5 17 10 17Z" fill="currentColor"/>
    <path class="flame-inner" d="M10 15.5 C8 15.5 7 14 7.5 12 C8 13 9 13.5 10 13.5 C11 13.5 12 13 12 12 C12.5 14 12 15.5 10 15.5Z" fill="rgba(255,220,80,0.8)"/>
  </svg>`}`;if("snowflake"===e)return q`${G`<svg class="${s} ent-icon-snowflake" style="${i}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;if("fan"===e)return q`${G`<svg class="${s} ent-icon-fan ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(120 10 10)"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`;if("pulse"===e)return q`${G`<svg class="${s} ent-icon-pulse ${o}" style="${i}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`;if("wave"===e)return q`${G`<svg class="${s} ent-icon-wave" style="${i}" viewBox="0 0 20 20">
    <polyline class="energy-wave" points="2,10 5,5 8,15 11,5 14,15 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}`;if("sun"===e)return q`${G`<svg class="${s} ent-icon-sun ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3.5" fill="currentColor"/>
      <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="10" x2="4" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.3" y1="4.3" x2="5.7" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14.3" y1="14.3" x2="15.7" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.7" y1="4.3" x2="14.3" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="5.7" y1="14.3" x2="4.3" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </g>
  </svg>`}`;if("lightning"===e)return q`${G`<svg class="${s} ent-icon-lightning ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M11.5 2 L5 11 L9.5 11 L8.5 18 L15 9 L10.5 9 Z" fill="currentColor"/>
  </svg>`}`;if("heart"===e)return q`${G`<svg class="${s} ent-icon-heart ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="currentColor"/>
  </svg>`}`;if("bulb"===e)return q`${G`<svg class="${s} ent-icon-bulb ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7 3 5 5.5 5 8 C5 10.2 6.5 11.8 7 13 L13 13 C13.5 11.8 15 10.2 15 8 C15 5.5 13 3 10 3Z" fill="currentColor" opacity="0.9"/>
    <rect class="bulb-base1" x="7.5" y="13.5" width="5" height="1.5" rx="0.5" fill="currentColor" opacity="0.65"/>
    <rect class="bulb-base2" x="8.2" y="15.5" width="3.6" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`;if("leaf"===e)return q`${G`<svg class="${s} ent-icon-leaf ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="leaf-body" d="M10 17 C10 17 4 13 4 8 C4 5 7 3 10 3 C13 3 16 5 16 8 C16 13 10 17 10 17Z" fill="currentColor"/>
    <line x1="10" y1="17" x2="10" y2="9" stroke="rgba(0,0,0,0.25)" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`;if("moon"===e)return q`${G`<svg class="${s} ent-icon-moon ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
  </svg>`}`;if("water"===e)return q`${G`<svg class="${s} ent-icon-water ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="drop-body" d="M10 3 C10 3 5 9 5 13 C5 16 7.2 18 10 18 C12.8 18 15 16 15 13 C15 9 10 3 10 3Z" fill="currentColor"/>
  </svg>`}`;if("lock"===e)return q`${G`<svg class="${s} ent-icon-lock ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5 L13 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`;if("flame2"===e)return q`${G`<svg class="${s} ent-icon-flame2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="flame-main" d="M7 17 C4.5 17 3 15 3 12.5 C3 10 4.5 8.5 5.5 6.5 C5.5 9 6.5 10 7.5 10 C8 8.5 8 7.5 8 6 C9.5 7.5 11 9.5 11 12.5 C11 15 9.5 17 7 17Z" fill="currentColor"/>
    <path class="flame-b" d="M13 17 C10.5 17 9 15 9 12.5 C9 10 10.5 8.5 11.5 6.5 C11.5 9 12.5 10 13.5 10 C14 8.5 14 7.5 14 6 C15.5 7.5 17 9.5 17 12.5 C17 15 15.5 17 13 17Z" fill="currentColor" opacity="0.72"/>
  </svg>`}`;if("flame3"===e)return q`${G`<svg class="${s} ent-icon-flame3 ${o}" style="${i}" viewBox="0 0 20 20">
    <ellipse cx="10" cy="17" rx="6" ry="1.5" fill="currentColor" opacity="0.45"/>
    <line x1="6.5" y1="17" x2="9" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <line x1="13.5" y1="17" x2="11" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <path class="flame-main" d="M10 14.5 C8 14.5 6.5 12.5 6.5 10.5 C6.5 9 7.5 7.5 9 6 C9 8 9.5 9 10 9 C10.5 9 11 8 11 6 C12.5 7.5 13.5 9 13.5 10.5 C13.5 12.5 12 14.5 10 14.5Z" fill="currentColor"/>
  </svg>`}`;if("snowflake2"===e)return q`${G`<svg class="${s} ent-icon-snowflake2" style="${i}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;if("snowflake3"===e)return q`${G`<svg class="${s} ent-icon-snowflake3" style="${i}" viewBox="0 0 20 20">
    <g class="snow-drift-g" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`;if("fan2"===e)return q`${G`<svg class="${s} ent-icon-fan2 ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(90 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(180 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(270 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`;if("fan3"===e)return q`${G`<svg class="${s} ent-icon-fan3 ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(120 10 10)"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
  </svg>`}`;if("lightning2"===e)return q`${G`<svg class="${s} ent-icon-lightning2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="bolt-a" d="M8 2 L4 9.5 L7.5 9.5 L6.5 17 L11 9.5 L7.5 9.5Z" fill="currentColor"/>
    <path class="bolt-b" d="M13.5 2 L9.5 9.5 L13 9.5 L12 17 L16.5 9.5 L13 9.5Z" fill="currentColor" opacity="0.65"/>
  </svg>`}`;if("lightning3"===e)return q`${G`<svg class="${s} ent-icon-lightning3 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="arc-path" d="M3 4 Q10 1 17 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="16" r="1.5" fill="currentColor"/>
  </svg>`}`;if("bulb2"===e)return q`${G`<svg class="${s} ent-icon-bulb2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7.5 3 6 5.2 6 7.5 C6 9.5 7 11.2 7.5 12.5 L12.5 12.5 C13 11.2 14 9.5 14 7.5 C14 5.2 12.5 3 10 3Z" fill="currentColor" opacity="0.85"/>
    <path class="bulb-filament" d="M8.5 9.5 Q9.5 8 10 9 Q10.5 10 11.5 8.5" fill="none" stroke="rgba(255,210,70,0.95)" stroke-width="0.9" stroke-linecap="round"/>
    <rect class="bulb-base1" x="7.8" y="13" width="4.4" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
    <rect class="bulb-base2" x="8.3" y="15" width="3.4" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`;if("bulb3"===e)return q`${G`<svg class="${s} ent-icon-bulb3 ${o}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,3 14.3,5.5 14.3,10.5 10,13 5.7,10.5 5.7,5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle class="bulb-chip" cx="10" cy="8" r="2" fill="currentColor" opacity="0.9"/>
    <line x1="10" y1="13" x2="10" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`;if("water2"===e)return q`${G`<svg class="${s} ent-icon-water2" style="${i}" viewBox="0 0 20 20">
    <polyline class="wave-a" points="1,8 4,5 7,11 10,5 13,11 16,5 19,8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48"/>
    <polyline class="wave-b" points="1,13 4,10 7,16 10,10 13,16 16,10 19,13" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48" opacity="0.5"/>
  </svg>`}`;if("water3"===e)return q`${G`<svg class="${s} ent-icon-water3 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <circle class="ripple1" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle class="ripple2" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>
  </svg>`}`;if("sun2"===e)return q`${G`<svg class="${s} ent-icon-sun2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M3.5 13 A6.5 6.5 0 0 1 16.5 13 Z" fill="currentColor"/>
    <line x1="10" y1="2" x2="10" y2="5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="4.5" y1="4.5" x2="6.8" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="15.5" y1="4.5" x2="13.2" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="1.5" y1="10" x2="4.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="18.5" y1="10" x2="15.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="3.5" y1="13" x2="16.5" y2="13" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.35"/>
  </svg>`}`;if("sun3"===e)return q`${G`<svg class="${s} ent-icon-sun3 ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3" fill="currentColor"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(30 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(90 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(150 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(180 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(210 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(240 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(270 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(300 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(330 10 10)"/>
    </g>
  </svg>`}`;if("moon2"===e)return q`${G`<svg class="${s} ent-icon-moon2 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="currentColor" opacity="0.9"/>
    <circle cx="7.5" cy="8" r="1.5" fill="rgba(0,0,0,0.14)"/>
    <circle cx="12.5" cy="12" r="1" fill="rgba(0,0,0,0.11)"/>
    <circle cx="8" cy="13" r="0.7" fill="rgba(0,0,0,0.1)"/>
  </svg>`}`;if("moon3"===e)return q`${G`<svg class="${s} ent-icon-moon3 ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
    <circle class="star1" cx="3.5" cy="5" r="0.9" fill="currentColor"/>
    <circle class="star2" cx="2" cy="12" r="0.7" fill="currentColor"/>
    <circle class="star3" cx="5.5" cy="16.5" r="0.7" fill="currentColor"/>
  </svg>`}`;if("wind"===e)return q`${G`<svg class="${s} ent-icon-wind ${o}" style="${i}" viewBox="0 0 20 20">
    <polyline class="wind-line-a" points="2,6 5,5 8,7 11,5 14,7 18,6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" opacity="1"/>
    <polyline class="wind-line-b" points="2,10 5,9 8,11 11,9 14,11 18,10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" opacity="0.65"/>
    <polyline class="wind-line-c" points="2,14 5,13 8,15 11,13 16,15" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16" opacity="0.35"/>
  </svg>`}`;if("wind2"===e)return q`${G`<svg class="${s} ent-icon-wind2 ${o}" style="${i}" viewBox="0 0 20 20">
    <polyline class="gust-a" points="3,6 6,10 3,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="gust-b" points="8,6 11,10 8,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    <polyline class="gust-c" points="13,6 16,10 13,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  </svg>`}`;if("wind3"===e)return q`${G`<svg class="${s} ent-icon-wind3 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="spiral-path" d="M10 10 C14 8 16 5 13 3 C10 1 7 4 8 7 C9 10 13 12 15 11 C18 9 17 5 14 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.5"/>
  </svg>`}`;if("bell"===e)return q`${G`<svg class="${s} ent-icon-bell ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M10 3 C10 3 7 5 7 9 L7 13 L4 14 L4 15 L16 15 L16 14 L13 13 L13 9 C13 5 10 3 10 3Z" fill="currentColor"/>
    <path d="M8.5 15.5 C8.5 16.5 9 17.5 10 17.5 C11 17.5 11.5 16.5 11.5 15.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="10" cy="2.5" r="1.2" fill="currentColor" opacity="0.6"/>
  </svg>`}`;if("bell2"===e)return q`${G`<svg class="${s} ent-icon-bell2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M7 4 C7 4 5 6 5 9 L5 13 L3 14 L3 15 L13 15 L13 14 L11 13 L11 9 C11 6 9 4 7 4Z" fill="currentColor" opacity="0.9"/>
    <path d="M6.5 15.5 C6.5 16.3 7 17 8 17 C9 17 9.5 16.3 9.5 15.5" fill="none" stroke="currentColor" stroke-width="1.1"/>
    <path class="ring-a" d="M13 7 Q15 9 13 11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="ring-b" d="M14.5 5.5 Q17.5 9 14.5 12.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path class="ring-c" d="M16 4 Q20 9 16 14" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;if("bell3"===e)return q`${G`<svg class="${s} ent-icon-bell3 ${o}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,2 18,16 2,16" fill="currentColor" opacity="0.85"/>
    <rect x="9.3" y="7" width="1.4" height="5" rx="0.7" fill="rgba(0,0,0,0.45)"/>
    <circle cx="10" cy="14" r="1" fill="rgba(0,0,0,0.45)"/>
  </svg>`}`;if("thermometer"===e)return q`${G`<svg class="${s} ent-icon-thermometer ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="8.5" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect class="therm-mercury" x="9" y="7" width="2" height="6" rx="1" fill="currentColor"/>
    <circle cx="10" cy="15" r="3" fill="currentColor"/>
    <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.25)"/>
  </svg>`}`;if("thermometer2"===e)return q`${G`<svg class="${s} ent-icon-thermometer2 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="7" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="7.5" y="5" width="2" height="8" rx="1" fill="currentColor"/>
    <circle cx="8.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-arrow" points="14,12 14,5 12,7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="14" y1="5" x2="16" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`;if("thermometer3"===e)return q`${G`<svg class="${s} ent-icon-thermometer3 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="8" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="8.5" y="6" width="2" height="7" rx="1" fill="currentColor"/>
    <circle cx="9.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-up" points="14.5,11 14.5,6 13,8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <line x1="14.5" y1="6" x2="16" y2="8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.9"/>
    <polyline class="therm-down" points="17.5,9 17.5,14 16,12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <line x1="17.5" y1="14" x2="19" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`;if("battery"===e)return q`${G`<svg class="${s} ent-icon-battery ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="9" height="4" rx="0.8" fill="currentColor" opacity="0.9"/>
  </svg>`}`;if("battery2"===e)return q`${G`<svg class="${s} ent-icon-battery2 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="4" height="4" rx="0.8" fill="currentColor" opacity="0.5"/>
    <path class="charge-bolt" d="M10 7.5 L8 10.5 L10 10.5 L8.5 13.5 L12 9.5 L10 9.5 Z" fill="currentColor" opacity="0.9"/>
  </svg>`}`;if("battery3"===e)return q`${G`<svg class="${s} ent-icon-battery3 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="2" height="4" rx="0.8" fill="currentColor"/>
  </svg>`}`;if("star"===e)return q`${G`<svg class="${s} ent-icon-star ${o}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,2 12.2,7.6 18.1,7.6 13.5,11.4 15.3,17.1 10,13.6 4.7,17.1 6.5,11.4 1.9,7.6 7.8,7.6" fill="currentColor"/>
  </svg>`}`;if("star2"===e)return q`${G`<svg class="${s} ent-icon-star2 ${o}" style="${i}" viewBox="0 0 20 20">
    <g class="star-body" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
    </g>
  </svg>`}`;if("star3"===e)return q`${G`<svg class="${s} ent-icon-star3 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle cx="5" cy="5" r="2" fill="currentColor"/>
    <line class="star-tail" x1="5" y1="5" x2="15" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
    <line x1="5" y1="5" x2="12" y2="12" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;if("pulse2"===e)return q`${G`<svg class="${s} ent-icon-pulse2 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle class="pulse-ring2" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`;if("pulse3"===e)return q`${G`<svg class="${s} ent-icon-pulse3 ${o}" style="${i}" viewBox="0 0 20 20">
    <polyline class="ekg-line" points="1,10 4,10 5.5,4 7,13 8.5,8 10,10 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="0"/>
  </svg>`}`;if("wave2"===e)return q`${G`<svg class="${s} ent-icon-wave2 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect class="bar-odd"  x="2"  y="8"  width="2" height="8"  rx="1" fill="currentColor" style="transform-origin:3px 16px"/>
    <rect class="bar-even" x="5.5" y="5" width="2" height="11" rx="1" fill="currentColor" style="transform-origin:6.5px 16px"/>
    <rect class="bar-odd"  x="9"  y="7"  width="2" height="9"  rx="1" fill="currentColor" style="transform-origin:10px 16px"/>
    <rect class="bar-even" x="12.5" y="4" width="2" height="12" rx="1" fill="currentColor" style="transform-origin:13.5px 16px"/>
    <rect class="bar-odd"  x="16" y="9"  width="2" height="7"  rx="1" fill="currentColor" style="transform-origin:17px 16px"/>
  </svg>`}`;if("wave3"===e)return q`${G`<svg class="${s} ent-icon-wave3 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 1 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 0 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 1 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 0 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 1 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 0 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
  </svg>`}`;if("wave4"===e)return q`${G`<svg class="${s} ent-icon-wave4 ${o}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
    <path class="wifi-a" d="M6.5 13 A5 5 0 0 1 13.5 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="wifi-b" d="M3.5 10 A9 9 0 0 1 16.5 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
    <path class="wifi-c" d="M1 7 A13 13 0 0 1 19 7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`;if("heart2"===e)return q`${G`<svg class="${s} ent-icon-heart2 ${o}" style="${i}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`}`;if("leaf2"===e)return q`${G`<svg class="${s} ent-icon-leaf2 ${o}" style="${i}" viewBox="0 0 20 20">
    <line x1="10" y1="18" x2="10" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="7.5" cy="11" rx="3" ry="1.8" fill="currentColor" opacity="0.9" transform="rotate(-30 7.5 11)"/>
    <ellipse cx="12.5" cy="9" rx="3" ry="1.8" fill="currentColor" opacity="0.7" transform="rotate(30 12.5 9)"/>
  </svg>`}`;if("lock2"===e)return q`${G`<svg class="${s} ent-icon-lock2 ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`;const a=G`
    <rect x="2" y="3" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <line x1="7" y1="17.5" x2="13" y2="17.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="10" y1="14" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.4"/>`;return"display"===e?q`${G`<svg class="${s} ent-icon-display ${o}" style="${i}" viewBox="0 0 20 20">
    ${a}
    <rect class="scr-panel" x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.35"/>
  </svg>`}`:"display2"===e?q`${G`<svg class="${s} ent-icon-display2 ${o}" style="${i}" viewBox="0 0 20 20">
    ${a}
    <rect x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.18"/>
    <rect class="scr-line" x="3.5" y="4.5" width="13" height="1.2" fill="currentColor" opacity="0.75"/>
  </svg>`}`:"display3"===e?q`${G`<svg class="${s} ent-icon-display3 ${o}" style="${i}" viewBox="0 0 20 20">
    ${a}
    <rect class="scr-wake" x="3.5" y="4.5" width="13" height="8" rx="0.8" fill="currentColor" opacity="0.4" style="transform-origin:10px 8.5px"/>
  </svg>`}`:"oven"===e?q`${G`<svg class="${s} ent-icon-oven ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="3" y="3.5" width="14" height="13.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="6" cy="6.3" r="0.9" fill="currentColor"/>
    <circle cx="9" cy="6.3" r="0.9" fill="currentColor"/>
    <line x1="12" y1="6.3" x2="14.5" y2="6.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="5.5" y="9" width="9" height="6" rx="1" fill="currentColor" opacity="0.22"/>
    <path class="heat-a" d="M7.5 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-b" d="M10 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-c" d="M12.5 14 q0.8 -1 0 -2 t0 -2" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`:"washer"===e||"washer2"===e?q`${G`<svg class="${s} ent-icon-${e} ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="3" y="2" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="6" cy="4.8" r="0.8" fill="currentColor"/>
    <circle cx="8.5" cy="4.8" r="0.8" fill="currentColor"/>
    <circle cx="10" cy="11.5" r="4.8" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <g class="drum" style="transform-origin:10px 11.5px">
      <path d="M10 8.2 A3.3 3.3 0 0 1 13.3 11.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M10 14.8 A3.3 3.3 0 0 1 6.7 11.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </g>
    <path class="drum-water" d="M6.5 13 q1.2 -1 2.4 0 t2.4 0 t2.4 0" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6" stroke-dasharray="14"/>
  </svg>`}`:"dishwasher"===e?q`${G`<svg class="${s} ent-icon-dishwasher ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="3" y="3" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <line x1="5" y1="7.5" x2="15" y2="7.5" stroke="currentColor" stroke-width="1" stroke-dasharray="1.6 1.2" opacity="0.7"/>
    <line x1="5" y1="10.5" x2="15" y2="10.5" stroke="currentColor" stroke-width="1" stroke-dasharray="1.6 1.2" opacity="0.7"/>
    <line class="spray-arm" x1="6.5" y1="14.5" x2="13.5" y2="14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="transform-origin:10px 14.5px"/>
    <line class="spray-a" x1="8" y1="14" x2="6" y2="11.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>
    <line class="spray-b" x1="12" y1="14" x2="14" y2="11.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`:"floorheat"===e?q`${G`<svg class="${s} ent-icon-floorheat ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="14" width="16" height="3.5" rx="0.8" fill="currentColor" opacity="0.85"/>
    <line x1="6.5" y1="14" x2="6.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <line x1="10.5" y1="14" x2="10.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <line x1="14.5" y1="14" x2="14.5" y2="17.5" stroke="rgba(0,0,0,0.4)" stroke-width="0.8"/>
    <path class="heat-a" d="M5.5 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="heat-b" d="M10 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="heat-c" d="M14.5 12 q1 -1.5 0 -3 t0 -3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`}`:"radiator"===e?q`${G`<svg class="${s} ent-icon-radiator ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2.5" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="5.7" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="8.8" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="11.9" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <rect x="15.1" y="7" width="2.4" height="10" rx="1.2" fill="currentColor"/>
    <line x1="2.5" y1="9.5" x2="17.5" y2="9.5" stroke="rgba(0,0,0,0.35)" stroke-width="0.9"/>
    <line x1="2.5" y1="14.5" x2="17.5" y2="14.5" stroke="rgba(0,0,0,0.35)" stroke-width="0.9"/>
    <path class="heat-a" d="M6 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-b" d="M10 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path class="heat-c" d="M14 5.5 q0.8 -1 0 -2 t0 -1.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`:"valve"===e?q`${G`<svg class="${s} ent-icon-valve ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="1.5" y="11.5" width="17" height="3.6" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="9.1" y="8" width="1.8" height="4" fill="currentColor"/>
    <g class="wheel" style="transform-origin:10px 6px">
      <circle cx="10" cy="6" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <line x1="10" y1="2.6" x2="10" y2="9.4" stroke="currentColor" stroke-width="1.2"/>
      <line x1="6.6" y1="6" x2="13.4" y2="6" stroke="currentColor" stroke-width="1.2"/>
    </g>
  </svg>`}`:"smoke"===e?q`${G`<svg class="${s} ent-icon-smoke ${o}" style="${i}" viewBox="0 0 20 20">
    <circle class="det-ring" cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    <circle cx="10" cy="3.6" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="16.4" cy="10" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="10" cy="16.4" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle cx="3.6" cy="10" r="0.7" fill="currentColor" opacity="0.6"/>
    <circle class="det-led" cx="10" cy="10" r="1.7" fill="currentColor"/>
  </svg>`}`:"camera"===e?q`${G`<svg class="${s} ent-icon-camera ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="2.5" y="6" width="11" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M13.5 8.5 L18 6.5 L18 14.5 L13.5 12.5 Z" fill="currentColor" opacity="0.55"/>
    <circle cx="8" cy="10.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="8" cy="10.5" r="0.9" fill="currentColor"/>
    <circle class="rec-dot" cx="4.8" cy="8.2" r="0.9" fill="#f43f5e"/>
  </svg>`}`:"strip"===e||"strip2"===e?q`${G`<svg class="${s} ent-icon-${e} ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="1.5" y="7.5" width="17" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <circle class="led led-1" cx="4.5"  cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-2" cx="7.25" cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-3" cx="10"   cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-4" cx="12.75" cy="10" r="1.15" fill="currentColor"/>
    <circle class="led led-5" cx="15.5" cy="10" r="1.15" fill="currentColor"/>
  </svg>`}`:"plug"===e?q`${G`<svg class="${s} ent-icon-plug ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="7.3" y="3" width="1.8" height="5" rx="0.6" fill="currentColor"/>
    <rect x="10.9" y="3" width="1.8" height="5" rx="0.6" fill="currentColor"/>
    <rect x="5" y="8" width="10" height="7.5" rx="2" fill="currentColor" opacity="0.9"/>
    <line x1="10" y1="15.5" x2="10" y2="18.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <polygon class="spark" points="14.5,1.5 13,4.5 14.6,4.3 13.6,7 16.2,3.6 14.7,3.8" fill="currentColor"/>
  </svg>`}`:"garage"===e?q`${G`<svg class="${s} ent-icon-garage ${o}" style="${i}" viewBox="0 0 20 20">
    <path d="M2 9 L10 2.8 L18 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="3.5" y="9" width="13" height="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <rect class="door" x="6" y="10.5" width="8" height="7" fill="currentColor" opacity="0.7" style="transform-origin:10px 10.5px"/>
    <line x1="6" y1="13" x2="14" y2="13" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>
    <line x1="6" y1="15.3" x2="14" y2="15.3" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>
  </svg>`}`:"router"===e?q`${G`<svg class="${s} ent-icon-router ${o}" style="${i}" viewBox="0 0 20 20">
    <line x1="5" y1="11" x2="4" y2="3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="15" y1="11" x2="16" y2="3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="4" cy="3" r="1" fill="currentColor"/>
    <circle cx="16" cy="3" r="1" fill="currentColor"/>
    <rect x="2" y="11" width="16" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle class="led led-1" cx="5.5" cy="14.3" r="0.95" fill="currentColor"/>
    <circle class="led led-2" cx="8.5" cy="14.3" r="0.95" fill="currentColor"/>
    <circle class="led led-3" cx="11.5" cy="14.3" r="0.95" fill="currentColor"/>
    <line x1="14" y1="14.3" x2="16" y2="14.3" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`:"pc"===e?q`${G`<svg class="${s} ent-icon-pc ${o}" style="${i}" viewBox="0 0 20 20">
    <rect x="11.5" y="2.5" width="6.5" height="15" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle class="pwr" cx="14.75" cy="5" r="0.85" fill="currentColor"/>
    <line x1="13" y1="7.5" x2="16.5" y2="7.5" stroke="currentColor" stroke-width="0.9" opacity="0.5"/>
    <line x1="13" y1="9.3" x2="16.5" y2="9.3" stroke="currentColor" stroke-width="0.9" opacity="0.5"/>
    <rect x="1.5" y="4" width="8.5" height="6.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <line x1="4" y1="13" x2="7.5" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="5.75" y1="10.5" x2="5.75" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <rect class="act act-1" x="3.2" y="7.2" width="1.3" height="2" rx="0.4" fill="currentColor" style="transform-origin:3.85px 9.2px"/>
    <rect class="act act-2" x="5.1" y="6" width="1.3" height="3.2" rx="0.4" fill="currentColor" style="transform-origin:5.75px 9.2px"/>
    <rect class="act act-3" x="7" y="6.8" width="1.3" height="2.4" rx="0.4" fill="currentColor" style="transform-origin:7.65px 9.2px"/>
  </svg>`}`:"ble"===e?q`${G`<svg class="${s} ent-icon-ble ${o}" style="${i}" viewBox="0 0 20 20">
    <circle class="ble-ring" cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0"/>
    <path d="M6 6.5 L14 13.5 L10 17 L10 3 L14 6.5 L6 13.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}`:q``}const ft={none:{on:"#6b7280",off:"#6b7280"},flame:{on:"#f97316",off:"#4b5563"},flame2:{on:"#f97316",off:"#4b5563"},flame3:{on:"#f97316",off:"#4b5563"},snowflake:{on:"#7dd3fc",off:"#7dd3fc"},snowflake2:{on:"#7dd3fc",off:"#7dd3fc"},snowflake3:{on:"#7dd3fc",off:"#7dd3fc"},fan:{on:"#f4601e",off:"#4b5563"},fan2:{on:"#f4601e",off:"#4b5563"},fan3:{on:"#f4601e",off:"#4b5563"},pulse:{on:"#f4601e",off:"#4b5563"},pulse2:{on:"#f4601e",off:"#4b5563"},pulse3:{on:"#f43f5e",off:"#4b5563"},wave:{on:"#f4601e",off:"#4b5563"},wave2:{on:"#5eead4",off:"#4b5563"},wave3:{on:"#7dd3fc",off:"#4b5563"},wave4:{on:"#93c5fd",off:"#4b5563"},sun:{on:"#fbbf24",off:"#4b5563"},sun2:{on:"#fbbf24",off:"#4b5563"},sun3:{on:"#fbbf24",off:"#4b5563"},lightning:{on:"#fbbf24",off:"#4b5563"},lightning2:{on:"#fbbf24",off:"#4b5563"},lightning3:{on:"#fbbf24",off:"#4b5563"},heart:{on:"#f43f5e",off:"#4b5563"},heart2:{on:"#f43f5e",off:"#4b5563"},bulb:{on:"#fde047",off:"#6b7280"},bulb2:{on:"#fbbf24",off:"#6b7280"},bulb3:{on:"#e0f2fe",off:"#6b7280"},leaf:{on:"#4ade80",off:"#4b5563"},leaf2:{on:"#4ade80",off:"#4b5563"},moon:{on:"#c4b5fd",off:"#4b5563"},moon2:{on:"#f1f5f9",off:"#4b5563"},moon3:{on:"#c4b5fd",off:"#4b5563"},water:{on:"#38bdf8",off:"#4b5563"},water2:{on:"#38bdf8",off:"#38bdf8"},water3:{on:"#38bdf8",off:"#4b5563"},lock:{on:"#a78bfa",off:"#4b5563"},lock2:{on:"#7ecfff",off:"#4b5563"},wind:{on:"#a5f3fc",off:"#4b5563"},wind2:{on:"#a5f3fc",off:"#4b5563"},wind3:{on:"#a5f3fc",off:"#4b5563"},bell:{on:"#fde68a",off:"#4b5563"},bell2:{on:"#fde68a",off:"#4b5563"},bell3:{on:"#fca5a5",off:"#4b5563"},thermometer:{on:"#fb923c",off:"#4b5563"},thermometer2:{on:"#f87171",off:"#4b5563"},thermometer3:{on:"#fb923c",off:"#4b5563"},battery:{on:"#4ade80",off:"#4b5563"},battery2:{on:"#fbbf24",off:"#4b5563"},battery3:{on:"#f87171",off:"#6b7280"},star:{on:"#fde047",off:"#4b5563"},star2:{on:"#fde047",off:"#4b5563"},star3:{on:"#fde047",off:"#4b5563"},display:{on:"#7dd3fc",off:"#4b5563"},display2:{on:"#7dd3fc",off:"#4b5563"},display3:{on:"#7dd3fc",off:"#4b5563"},oven:{on:"#fb923c",off:"#4b5563"},washer:{on:"#7dd3fc",off:"#4b5563"},washer2:{on:"#7dd3fc",off:"#4b5563"},dishwasher:{on:"#38bdf8",off:"#4b5563"},floorheat:{on:"#fb923c",off:"#4b5563"},radiator:{on:"#f87171",off:"#4b5563"},valve:{on:"#38bdf8",off:"#4b5563"},smoke:{on:"#f87171",off:"#6b7280"},camera:{on:"#e2e8f0",off:"#4b5563"},strip:{on:"#c084fc",off:"#4b5563"},strip2:{on:"#f472b6",off:"#4b5563"},plug:{on:"#fde68a",off:"#4b5563"},garage:{on:"#cbd5e1",off:"#4b5563"},ble:{on:"#60a5fa",off:"#4b5563"},router:{on:"#34d399",off:"#4b5563"},pc:{on:"#93c5fd",off:"#4b5563"}},mt=r`
  @keyframes flicker    { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }
  @keyframes snow-spin  { to{transform:rotate(360deg)} }
  @keyframes fan-spin   { to{transform:rotate(360deg)} }
  @keyframes blink      { 50%{opacity:.3} }
  @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,currentColor))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,currentColor))} }
  @keyframes wave-scroll{ to{stroke-dashoffset:-40} }
  @keyframes drip       { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }
  @keyframes heartbeat  { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }
  @keyframes leaf-sway  { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }
  @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }
  @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes arc-flash  { 0%,100%{opacity:0.15} 50%{opacity:1} }
  @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }
  @keyframes twinkle    { 0%,100%{opacity:1} 50%{opacity:0.15} }
  @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
  @keyframes wind-blow  { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }
  @keyframes bell-ring  { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }
  @keyframes therm-pulse{ 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }
  @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
  @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }
  @keyframes ekg-scan   { to{stroke-dashoffset:-50} }
  @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

  /* Flame */
  .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-b    { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
  .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }

  /* Snowflake */
  .ent-icon-snowflake  .snow-arms   { animation:snow-spin  calc(6s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake2 .snow-arms   { animation:snow-spin  calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake3 .snow-drift-g{ animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Fan */
  .ent-icon-fan.on  .fan-blades { animation:fan-spin calc(1s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }

  /* Pulse */
  .ent-icon-pulse.on  .pulse-ring  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-pulse3.on .ekg-line    { animation:ekg-scan    calc(1.5s / var(--ent-spd,1)) linear      infinite; stroke-dasharray:50; stroke-dashoffset:0; }

  /* Wave */
  .ent-icon-wave   .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-wave2.on .bar-odd   { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate;         transform-origin:50% 100%; }
  .ent-icon-wave2.on .bar-even  { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }
  .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s   / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s  / var(--ent-spd,1)); }

  /* Sun */
  .ent-icon-sun.on  .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }

  /* Lightning */
  .ent-icon-lightning.on  { animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
  .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Heart */
  .ent-icon-heart.on  .heart-shape { animation:heartbeat calc(1s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

  /* Bulb */
  .ent-icon-bulb.on  { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb2.on { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb3.on { animation:icon-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }

  /* Leaf */
  .ent-icon-leaf.on  .leaf-body { animation:leaf-sway calc(3s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }
  .ent-icon-leaf2.on { animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }

  /* Moon */
  .ent-icon-moon.on  { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon2.on { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s  / var(--ent-spd,1)); }
  .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }

  /* Water */
  .ent-icon-water.on   .drop-body { animation:drip       calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-water2     .wave-a    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; }
  .ent-icon-water2     .wave-b    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-water3.on  .ripple1   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-water3.on  .ripple2   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

  /* Lock */
  .ent-icon-lock.on  { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lock2.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Wind */
  .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }
  .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }
  .ent-icon-wind3.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Bell */
  .ent-icon-bell.on { animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }
  .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-bell3.on { animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Thermometer */
  .ent-icon-thermometer.on  .therm-mercury { animation:therm-pulse   calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }
  .ent-icon-thermometer2.on .therm-arrow   { animation:cover-bounce  calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-up      { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-down    { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

  /* Battery */
  .ent-icon-battery.on  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery3.on { animation:blink       calc(1.2s / var(--ent-spd,1)) step-end    infinite; }

  /* Star */
  .ent-icon-star.on  { animation:star-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }
  .ent-icon-star3.on { animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }

  /* Screens, appliances, heating, safety, strips, doors (2026-09) */
  @keyframes screen-flicker { 0%,100%{opacity:.35} 7%{opacity:.5} 11%{opacity:.22} 30%{opacity:.42} 46%{opacity:.18} 60%{opacity:.46} 78%{opacity:.3} }
  @keyframes scanline       { 0%{transform:translateY(0)} 100%{transform:translateY(6.8px)} }
  @keyframes screen-wake    { 0%{transform:scale(.06,.08);opacity:0} 35%{transform:scale(1,.1);opacity:1} 65%{transform:scale(1,1);opacity:.7} 100%{transform:scale(1,1);opacity:.4} }
  @keyframes heat-rise      { 0%{transform:translateY(2px);opacity:0} 40%{opacity:.9} 100%{transform:translateY(-3px);opacity:0} }
  @keyframes drum-tumble    { 0%{transform:rotate(0)} 45%{transform:rotate(320deg)} 60%{transform:rotate(290deg)} 100%{transform:rotate(360deg)} }
  @keyframes led-chase      { 0%,100%{opacity:.25} 20%{opacity:1} }
  /* Both keyframes carry the same filter functions in the same order: a list
     that changes function type between endpoints (drop-shadow → hue-rotate)
     interpolates discretely, so the card's copy never cycled at all. */
  @keyframes hue-cycle      { from{filter:drop-shadow(0 0 4px currentColor) hue-rotate(0deg)} to{filter:drop-shadow(0 0 4px currentColor) hue-rotate(360deg)} }
  @keyframes garage-door    { 0%,15%{transform:scaleY(1)} 45%,55%{transform:scaleY(.12)} 85%,100%{transform:scaleY(1)} }
  @keyframes spark-pop      { 0%,70%,100%{opacity:0;transform:scale(.6)} 75%,85%{opacity:1;transform:scale(1)} }

  .ent-icon-display.on  .scr-panel { animation:screen-flicker calc(2.4s / var(--ent-spd,1)) steps(1,end) infinite; }
  .ent-icon-display2.on .scr-line  { animation:scanline calc(2s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-display3.on .scr-wake  { animation:screen-wake calc(3s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-oven.on .heat-a, .ent-icon-floorheat.on .heat-a, .ent-icon-radiator.on .heat-a { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-oven.on .heat-b, .ent-icon-floorheat.on .heat-b, .ent-icon-radiator.on .heat-b { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.55s / var(--ent-spd,1)); }
  .ent-icon-oven.on .heat-c, .ent-icon-floorheat.on .heat-c, .ent-icon-radiator.on .heat-c { animation:heat-rise calc(1.6s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1.1s / var(--ent-spd,1)); }
  .ent-icon-oven.off .heat-a, .ent-icon-oven.off .heat-b, .ent-icon-oven.off .heat-c,
  .ent-icon-floorheat.off .heat-a, .ent-icon-floorheat.off .heat-b, .ent-icon-floorheat.off .heat-c,
  .ent-icon-radiator.off .heat-a, .ent-icon-radiator.off .heat-b, .ent-icon-radiator.off .heat-c { opacity:0; }
  .ent-icon-washer.on  .drum { animation:fan-spin calc(1.6s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-washer2.on .drum { animation:drum-tumble calc(2.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-washer.on .drum-water, .ent-icon-washer2.on .drum-water { animation:wave-scroll calc(1.8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-washer.off .drum-water, .ent-icon-washer2.off .drum-water { opacity:0; }
  .ent-icon-dishwasher.on .spray-arm { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-dishwasher.on .spray-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-dishwasher.on .spray-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
  .ent-icon-dishwasher.off .spray-a, .ent-icon-dishwasher.off .spray-b { opacity:0; }
  .ent-icon-valve.on .wheel { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-smoke.on  .det-led  { animation:blink calc(0.5s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-smoke.on  .det-ring { animation:icon-pulse calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-smoke.off .det-led  { fill:#4ade80; animation:blink calc(3s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-camera.on .rec-dot { animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }
  .ent-icon-camera.off .rec-dot { fill:currentColor; opacity:.4; }
  .ent-icon-strip.on .led-1 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-strip.on .led-2 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.2s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-3 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-4 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
  .ent-icon-strip.on .led-5 { animation:led-chase calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
  .ent-icon-strip.off .led { opacity:.35; }
  .ent-icon-strip2.on { animation:hue-cycle calc(4s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-strip2.on .led-1 { fill:#f87171; } .ent-icon-strip2.on .led-2 { fill:#fbbf24; } .ent-icon-strip2.on .led-3 { fill:#4ade80; }
  .ent-icon-strip2.on .led-4 { fill:#38bdf8; } .ent-icon-strip2.on .led-5 { fill:#a78bfa; }
  .ent-icon-strip2.off .led { opacity:.35; }
  .ent-icon-plug.on  .spark { animation:spark-pop calc(2s / var(--ent-spd,1)) ease-out infinite; transform-origin:14.6px 4.3px; }
  .ent-icon-plug.off .spark { opacity:0; }
  .ent-icon-garage.on .door { animation:garage-door calc(4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-ble.on .ble-ring { animation:ripple-out calc(1.6s / var(--ent-spd,1)) ease-out infinite; }
  .ent-icon-router.on .led-1 { animation:led-chase calc(1.1s / var(--ent-spd,1)) steps(1,end) infinite; }
  .ent-icon-router.on .led-2 { animation:led-chase calc(0.7s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.3s / var(--ent-spd,1)); }
  .ent-icon-router.on .led-3 { animation:led-chase calc(1.3s / var(--ent-spd,1)) steps(1,end) infinite; animation-delay:calc(-0.8s / var(--ent-spd,1)); }
  .ent-icon-router.off .led { opacity:.3; }
  .ent-icon-pc.on .pwr   { animation:blink calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-pc.on .act-1 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; }
  .ent-icon-pc.on .act-2 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; }
  .ent-icon-pc.on .act-3 { animation:bar-bounce calc(0.7s / var(--ent-spd,1)) ease-in-out infinite alternate; animation-delay:calc(-0.35s / var(--ent-spd,1)); }
  .ent-icon-pc.off .act  { opacity:.3; }
  .ent-icon-pc.off .pwr  { opacity:.4; }
`,bt=[{value:"none",label:"None",group:""},{value:"flame",label:"Flame",group:"🔥"},{value:"flame2",label:"Double",group:"🔥"},{value:"flame3",label:"Campfire",group:"🔥"},{value:"snowflake",label:"Snow",group:"❄️"},{value:"snowflake2",label:"6-arm",group:"❄️"},{value:"snowflake3",label:"Drifting",group:"❄️"},{value:"fan",label:"Fan 3",group:"🌀"},{value:"fan2",label:"Fan 4",group:"🌀"},{value:"fan3",label:"Vortex",group:"🌀"},{value:"lightning",label:"Bolt",group:"⚡"},{value:"lightning2",label:"Double",group:"⚡"},{value:"lightning3",label:"Arc",group:"⚡"},{value:"bulb",label:"Bulb",group:"💡"},{value:"bulb2",label:"Edison",group:"💡"},{value:"bulb3",label:"LED",group:"💡"},{value:"water",label:"Drop",group:"💧"},{value:"water2",label:"Waves",group:"💧"},{value:"water3",label:"Ripple",group:"💧"},{value:"sun",label:"Sun",group:"☀️"},{value:"sun2",label:"Sunrise",group:"☀️"},{value:"sun3",label:"Burst",group:"☀️"},{value:"moon",label:"Crescent",group:"🌙"},{value:"moon2",label:"Full",group:"🌙"},{value:"moon3",label:"Stars",group:"🌙"},{value:"pulse",label:"Pulse",group:"◉"},{value:"pulse2",label:"Double",group:"◉"},{value:"pulse3",label:"EKG",group:"◉"},{value:"wave",label:"Wave",group:"〜"},{value:"wave2",label:"Equalizer",group:"〜"},{value:"wave3",label:"Signal",group:"〜"},{value:"wave4",label:"WiFi",group:"〜"},{value:"heart",label:"Heart",group:"❤️"},{value:"heart2",label:"Outline",group:"❤️"},{value:"leaf",label:"Leaf",group:"🌿"},{value:"leaf2",label:"Sprout",group:"🌿"},{value:"lock",label:"Lock",group:"🔒"},{value:"lock2",label:"Unlocked",group:"🔒"},{value:"wind",label:"Flow",group:"💨"},{value:"wind2",label:"Gusts",group:"💨"},{value:"wind3",label:"Spiral",group:"💨"},{value:"bell",label:"Bell",group:"🔔"},{value:"bell2",label:"Ring",group:"🔔"},{value:"bell3",label:"Alarm",group:"🔔"},{value:"thermometer",label:"Therm",group:"🌡️"},{value:"thermometer2",label:"Hot",group:"🌡️"},{value:"thermometer3",label:"Cold/Hot",group:"🌡️"},{value:"battery",label:"Battery",group:"🔋"},{value:"battery2",label:"Charging",group:"🔋"},{value:"battery3",label:"Low",group:"🔋"},{value:"star",label:"Star",group:"⭐"},{value:"star2",label:"Sparkle",group:"⭐"},{value:"star3",label:"Shoot",group:"⭐"},{value:"display",label:"Flicker",group:"🖥️"},{value:"display2",label:"Scanline",group:"🖥️"},{value:"display3",label:"Wake",group:"🖥️"},{value:"oven",label:"Oven",group:"🍳"},{value:"washer",label:"Washer",group:"🫧"},{value:"washer2",label:"Tumble",group:"🫧"},{value:"dishwasher",label:"Dishes",group:"🫧"},{value:"floorheat",label:"Floor heat",group:"♨️"},{value:"radiator",label:"Radiator",group:"♨️"},{value:"valve",label:"Valve",group:"🚰"},{value:"smoke",label:"Smoke det.",group:"🚨"},{value:"camera",label:"Camera",group:"📷"},{value:"strip",label:"LED strip",group:"🌈"},{value:"strip2",label:"Rainbow",group:"🌈"},{value:"plug",label:"Plug",group:"🔌"},{value:"garage",label:"Garage",group:"🚗"},{value:"ble",label:"Bluetooth",group:"📡"},{value:"router",label:"Router",group:"📡"},{value:"pc",label:"PC",group:"💻"}];function yt(e){const{device:t,accent:i,online:s}=e,o=e.getInputChannels(t),a=o.filter(i=>null!=e.getInputActionLabel(t,i)),n=o.filter(i=>null==e.getInputActionLabel(t,i)),r=a.length<=1?1:a.length<=4?2:3,l=a.map(i=>({ch:i,chip:e.getInputSelectChip(t,i)})).filter(e=>null!=e.chip);return q`
    <div class="ts-inputs" style="--ts-accent:${i}">
      ${e.showEl("name")?q`
        <div class="ts-inputs-top">${at(t,s)}</div>`:Y}

      ${a.length&&e.showEl("keypad")?q`
        <div class="ts-keys" style="--keys:${r}"
          @click=${e=>e.stopPropagation()}>
          ${a.map(i=>function(e,t,i){const s=e.getInputActionLabel(t,i),o=e.getInputActionState(t,i),a=e.inputHasHold(t,i),n=()=>e.endInputHold(),r=i.label&&i.label.toLowerCase()!==s.toLowerCase()?i.label:"",l=e.getInputDimFeedback(i);return q`
    <button
      class="ts-key ${o?`is-${o}`:"is-neutral"} ${a?"holdable":""} ${l?"dimming":""}"
      title=${a?`${s} — hold to dim`:s}
      @click=${s=>e.runInputAction(t,i,s)}
      @pointerdown=${s=>e.startInputHold(t,i,s)}
      @pointerup=${n} @pointerleave=${n} @pointercancel=${n}>
      <span class="ts-key-pip"></span>
      <span class="ts-key-label">${s}</span>
      ${l?q`<span class="ts-key-sub ts-key-dim">${l.dir>0?"▲":"▼"} ${l.pct}%</span>`:r&&e.showEl("target_state")?q`<span class="ts-key-sub">${r}</span>`:Y}
      ${!l&&e.showEl("last_event")&&i.lastChanged?q`<span class="ts-key-age">${e.timeAgo(i.lastChanged)}</span>`:Y}
    </button>`}(e,t,i))}
        </div>`:Y}

      ${l.length&&e.showEl("keypad")?q`
        <div class="ts-key-chips" @click=${e=>e.stopPropagation()}>
          ${l.map(({ch:i,chip:s})=>q`
            ${l.length>1?q`<span class="ts-key-chip-lbl">${e.getInputActionLabel(t,i)}</span>`:Y}
            ${lt(e,s)}`)}
        </div>`:Y}

      ${n.length&&e.showEl("input_rows")?q`
        <div class="tile-inputs ${a.length?"ts-inputs-rest":""}"
          @click=${e=>e.stopPropagation()}>
          ${n.map(i=>rt(e,t,i))}
        </div>`:Y}

      ${o.length?Y:q`
        <span class="ts-inputs-empty">${it("empty.no_inputs")}</span>`}
    </div>`}const xt=new Set(["switch","light","cover","valve","climate","sensor","binary_sensor","fan","lock","media_player","vacuum","alarm_control_panel","humidifier","water_heater","update","button","number","select","text","camera","event"]);function wt(e,t,i,s){return{entity_id:e,domain:e.split(".")[0],state:i?.state??"unavailable",attributes:i?.attributes??{},device_id:t?.device_id,area_id:t?.area_id,platform:t?.platform?String(t.platform).toLowerCase():void 0,entity_category:t?.entity_category??void 0,...s}}function _t(e,t={},i){const s=!0===t.universal,o=s?new Set((t.includeIntegrations??[]).map(e=>e.toLowerCase())):null,a=s?new Set([...At,...t.excludeIntegrations??[]].map(e=>e.toLowerCase())):null,n=s&&t.includeDomains?.length?new Set(t.includeDomains):null,r=s?new Set(t.excludeDomains??[]):null,l=e.entities??{},c=e.devices??{},d=e.areas??{},p=new Map,h=new Map,u=new Map,g=new Set,v=(e,t,i)=>{h.has(e)||(h.set(e,t),i&&u.set(e,i))};for(const[t,i]of Object.entries(l)){if(!i?.device_id)continue;if(i.hidden_by)continue;const l=t.split(".")[0];if(!xt.has(l))continue;if(r?.has(l)){v(i.device_id,"domain");continue}if(n&&!n.has(l)){v(i.device_id,"domain");continue}const h=(i.platform??"").toLowerCase();if(!s&&"shelly"!==h&&"bthome"!==h){v(i.device_id,"shelly");continue}if(a?.has(h)&&!o?.has(h)){v(i.device_id,"integration",h);continue}const u=i.device_id;if(!p.has(u)){const e=c[u];if(!e)continue;const t=(e.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),o=(e.manufacturer??"").toLowerCase().includes("shelly")||"shelly"===h;if(!s&&"bthome"===h&&!o){v(u,"shelly");continue}const a=e.area_id??i.area_id,n=a?d[a]?.name:void 0;g.add(u),p.set(u,{device_id:u,name:e.name_by_user??e.name??u,area:n,model:null==e.model?void 0:String(e.model),model_id:null==e.model_id?void 0:String(e.model_id),hw_version:null==e.hw_version?void 0:String(e.hw_version),sw_version:null==e.sw_version?void 0:String(e.sw_version),ip:t?t[1]:void 0,isShelly:o,integration:h,labels:Array.isArray(e.labels)?[...e.labels]:void 0,entities:[]})}const f=p.get(u);"shelly"===h&&(f.isShelly=!0,f.integration="shelly"),f.entities.push(wt(t,i,e.states[t]))}const f=new Set;for(const[e,t]of p){if(f.has(e))continue;const i=c[e],s=i?.via_device_id;if(!s||!p.has(s)||f.has(s))continue;const o=c[s],a=i?.configuration_url??"",n=o?.configuration_url??"",r=e=>{const t=e.match(/https?:\/\/([^/]+)/);return t?t[1]:""},l=a&&n&&r(a)===r(n),d=!a&&n&&t.isShelly&&t.integration===p.get(s).integration;if(!l&&!d)continue;const h=p.get(s);h.entities.push(...t.entities),!h.ip&&t.ip&&(h.ip=t.ip),!h.model&&t.model&&(h.model=t.model),f.add(e)}for(const e of f)p.delete(e);const m=e=>{const t=[];for(const[i,s]of e?.connections??[])"mac"===i&&s&&t.push(`mac:${s.toLowerCase()}`);for(const[i,s]of e?.identifiers??[])i&&s&&t.push(`id:${i}:${String(s).toLowerCase()}`);return t},b=new Map;for(const e of p.keys())for(const t of m(c[e]))b.has(t)||b.set(t,[]),b.get(t).push(e);const y=new Map,x=e=>{let t=e;for(let e=0;y.has(t)&&e<8;e++)t=y.get(t);return t},w=e=>(e.ip?4:0)+("shelly"===e.integration?2:0);for(const e of b.values()){if(e.length<2)continue;const t=[...new Set(e.map(x))].filter(e=>p.has(e));if(t.length<2)continue;const i=t.reduce((e,t)=>{const i=p.get(t),s=p.get(e);return w(i)!==w(s)?w(i)>w(s)?t:e:i.entities.length>s.entities.length?t:e}),s=p.get(i);for(const e of t){if(e===i)continue;const t=p.get(e);s.entities.push(...t.entities),!s.ip&&t.ip&&(s.ip=t.ip),!s.model&&t.model&&(s.model=t.model),!s.area&&t.area&&(s.area=t.area),t.isShelly&&(s.isShelly=!0),t.labels?.length&&(s.labels=[...new Set([...s.labels??[],...t.labels])]),y.set(e,i),p.delete(e)}}let _=Array.from(p.values()).filter(e=>e.entities.length>0);const k=_.length;if(s&&(_=_.filter(e=>function(e,t){return"all"===t||(!!It(e)||"devices"===t&&Mt(e))}(e,t.scope??"devices"))),i){const e=new Map;i.notShelly=i.byIntegration=i.byDomain=0;for(const[t,s]of h)if(!g.has(t))if("shelly"===s)i.notShelly++;else if("domain"===s)i.byDomain++;else{i.byIntegration++;const s=u.get(t);s&&e.set(s,(e.get(s)??0)+1)}i.byScope=k-_.length,i.integrations=[...e.entries()].sort((e,t)=>t[1]-e[1]).map(([e])=>e)}return _.sort((e,t)=>e.name.localeCompare(t.name))}function kt(e){const t=e.entity_category;return"diagnostic"===t?"diagnostic":"config"===t?"config":"primary"}const At=new Set(["mobile_app","browser_mod","hassio","systemmonitor","backup","sun","nws","netgear","tplink_router","huawei_lte","huawei_ont","asuswrt","fritzbox_tools","fritz"]),St=new Set(["switch","light","cover","climate","lock","media_player","fan","valve","vacuum","siren","humidifier","water_heater","lawn_mower","alarm_control_panel"]),Ct=new Set(["temperature","humidity","illuminance","carbon_dioxide","gas","battery","power","energy","voltage","current","apparent_power","reactive_power","power_factor","pressure","moisture","motion","door","window","opening","smoke","vibration","occupancy"]),$t=new Set(["switch","light","cover","climate","valve","media_player"]),Et={media_player:[{type:"media-player-playback"},{type:"media-player-volume-slider"}],lock:[{type:"lock-commands"}],fan:[{type:"fan-speed"}],vacuum:[{type:"vacuum-commands"}],humidifier:[{type:"humidifier-toggle"},{type:"humidifier-modes"}],water_heater:[{type:"water-heater-operation-modes"}],lawn_mower:[{type:"lawn-mower-commands"}],siren:[{type:"toggle"}],alarm_control_panel:[{type:"alarm-modes"}]};function Tt(e){return e.entities.filter(e=>"primary"===kt(e)&&!$t.has(e.domain)&&e.domain in Et)}const It=e=>e.entities.some(e=>"primary"===kt(e)&&St.has(e.domain)),Mt=e=>e.entities.some(e=>"primary"===kt(e)&&("sensor"===e.domain||"binary_sensor"===e.domain)&&Ct.has(e.attributes?.device_class??""));const Dt={relay:"Relay",plug:"Plug",dimmer:"Dimmer",rgb:"RGB",climate:"TRV",cover:"Roller",valve:"Valve",lock:"Lock",media:"Media",energy:"Energy",sensor:"Sensor",input:"Input",uni:"UNI",wall_display:"Display",generic:""},Ot={relay:"power-monitor",plug:"power-monitor",energy:"power-monitor",dimmer:"light-control",rgb:"light-control",climate:"climate-control",wall_display:"climate-control",cover:"cover-control",sensor:"sensor-card",input:"input-control"};function zt(e,t){return"wall_display"===e?t.entities.some(e=>"climate"===e.domain)?"climate-control":void 0:Ot[e]}const Pt={default:[{id:"toggle",label:"On/off button"}],"power-monitor":[{id:"toggle",label:"On/off button"},{id:"graph",label:"Graphs (spark + sensor rows)"},{id:"secondary",label:"Secondary readings (V/A/kWh)"},{id:"header_chips",label:"Chips in the name row",def:!1},{id:"uptime",label:"Uptime badge"},{id:"lower_body",label:"Lower body (blocks)"}],"light-control":[{id:"toggle",label:"On/off button"},{id:"color_wheel",label:"Colour wheel"},{id:"brightness",label:"Brightness slider"},{id:"color_temp",label:"Colour temperature"},{id:"white",label:"White channel"},{id:"effects",label:"Effects"},{id:"power",label:"Power reading"},{id:"graphs",label:"Sensor graphs (with Show graphs)"}],"climate-control":[{id:"heating_badge",label:"Heating badge"},{id:"dial",label:"Temperature dial"},{id:"adjust_buttons",label:"+/− buttons"},{id:"stats",label:"Stats row"},{id:"presets",label:"Preset buttons"},{id:"graphs",label:"Sensor graphs (with Show graphs)"}],"cover-control":[{id:"position_pct",label:"Position %"},{id:"shutter_graphic",label:"Shutter graphic"},{id:"moving_label",label:"Moving label"},{id:"buttons",label:"Open / stop / close"},{id:"position_slider",label:"Position slider (covers that report one)"},{id:"graphs",label:"Sensor graphs (with Show graphs)"}],"sensor-card":[{id:"primary_value",label:"Primary value"},{id:"trend",label:"Trend arrow"},{id:"graph",label:"Sparkline graphs"},{id:"secondary",label:"Secondary chips"},{id:"header_chips",label:"Chips in the name row",def:!1}],"input-control":[{id:"name",label:"Name"},{id:"keypad",label:"Channel keys"},{id:"input_rows",label:"Unassigned channel rows"},{id:"target_state",label:"Channel name under the key"},{id:"last_event",label:"Last-pressed time"}],"scene-button":[{id:"icon",label:"Icon"},{id:"name",label:"Name"},{id:"timestamp",label:"Last-triggered time"},{id:"input_rows",label:"Input channel rows"}]};function Rt(e){if(e)return e.map(e=>Array.isArray(e)?e:[e])}const Bt={relay:["name_row","relay_channels","sensors","graph","power_bar","virtual_controls","delegated_controls","badges"],plug:["name_row","sensors","graph","power_bar","virtual_controls","delegated_controls","badges"],dimmer:["name_row","dimmer","sensors","graph","virtual_controls","delegated_controls","badges"],rgb:["name_row","dimmer","sensors","graph","virtual_controls","delegated_controls","badges"],climate:["name_row","sensors","trv_control","virtual_controls","delegated_controls","badges"],cover:["name_row","cover_controls","sensors","virtual_controls","delegated_controls","badges"],valve:["name_row","sensors","valve_controls","virtual_controls","delegated_controls","badges"],lock:["name_row","sensors","virtual_controls","delegated_controls","badges"],media:["name_row","media_controls","sensors","virtual_controls","delegated_controls","badges"],energy:["name_row","sensors","graph","virtual_controls","delegated_controls","badges"],sensor:["name_row","sensors","graph","virtual_controls","delegated_controls","badges"],input:["name_row","sensors","input_channels","virtual_controls","delegated_controls","badges"],uni:["name_row","input_channels","sensors","virtual_controls","delegated_controls","badges"],wall_display:["name_row","sensors","graph","trv_control","media_controls","virtual_controls","delegated_controls","badges"],generic:["name_row","sensors","virtual_controls","delegated_controls","badges"]},Lt=[{match:/wall\s*display/i,profile:"wall_display"},{match:/\btrv\b/i,profile:"climate"},{match:/smoke|flood|motion|door.?\/?\s?window|\bh\s?&\s?t\b/i,profile:"sensor"},{match:/button/i,profile:"input"},{match:/\bi[34]\b/i,profile:"input"},{match:/valve/i,profile:"valve"},{match:/rgbw/i,profile:"rgb"},{match:/dimmer/i,profile:"dimmer"},{match:/plug/i,profile:"plug"},{match:/\b3?em\b/i,profile:"energy"},{match:/\buni\b/i,profile:"uni"},{match:/\b[12]pm\b|\bpro\b|\bshelly\s*(plus\s*)?[12](\.5|l)?\b|\b[12]l\b/i,profile:"relay"}];const Ft={relay:["power","energy","voltage","current","temperature","overtemp","overpower"],plug:["power","energy","voltage","current","overtemp","overpower"],energy:["power","energy","voltage","current","apparent_power","power_factor","frequency"],dimmer:["power","energy","temperature","overtemp"],rgb:["power","energy"],cover:["power","energy","temperature"],lock:["battery"],climate:["temperature","humidity","battery"],wall_display:["temperature","humidity","illuminance"],valve:["temperature"],sensor:["temperature","humidity","illuminance","co2","gas","battery","motion","door","flood","smoke","vibration"],input:["battery"],uni:["temperature","battery"]},Nt=["power","temperature","humidity","battery"];function jt(e,t){const i={},s=s=>{for(const o of e.entities){if("sensor"!==o.domain||!!o.entity_category!==s)continue;const e=t[o.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const a=e.attributes?.device_class??o.attributes?.device_class;if(!a||a in i)continue;const n=parseFloat(e.state??"");isNaN(n)||(i[a]={value:n,diagnostic:s})}};return s(!1),s(!0),i}const Ht=[{key:"power",label:"W",min:0,max:3e3,digits:0},{key:"voltage",label:"V",min:0,max:250,digits:0},{key:"current",label:"A",min:0,max:16,digits:2},{key:"temperature",label:"°C",min:-10,max:40,digits:1,stops:["#38bdf8","#fde047","#f87171"],diag:{min:0,max:100}},{key:"humidity",label:"%",min:0,max:100,digits:0,stops:["#fde68a","#2dd4bf","#0ea5e9"]},{key:"illuminance",label:"lx",min:0,max:2e3,digits:0,stops:["#94a3b8","#fde047","#fffbeb"]},{key:"carbon_dioxide",label:"ppm",min:400,max:2e3,digits:0,stops:["#4ade80","#fde047","#f87171"]},{key:"battery",label:"%",min:0,max:100,digits:0,stops:["#f87171","#fde047","#4ade80"]}];function Ut(e){const t=(e??"").trim();if(!t)return null;const i=/^#([0-9a-f]{3,8})$/i.exec(t);if(i){const e=i[1],t=e=>e+e;return 3===e.length||4===e.length?{hex:"#"+[...e.slice(0,3)].map(t).join(""),alpha:4===e.length?parseInt(t(e[3]),16)/255:1}:6===e.length||8===e.length?{hex:"#"+e.slice(0,6).toLowerCase(),alpha:8===e.length?parseInt(e.slice(6,8),16)/255:1}:null}const s=/^rgba?\(([^)]+)\)$/i.exec(t);if(s){const e=s[1].split(/[,\s/]+/).filter(Boolean);if(e.length<3)return null;const t=e.slice(0,3).map(e=>{const t=e.endsWith("%")?parseFloat(e)/100*255:parseFloat(e);return Math.max(0,Math.min(255,Math.round(t)))});if(t.some(isNaN))return null;const i=e[3],o=void 0===i?1:i.endsWith("%")?parseFloat(i)/100:parseFloat(i);return{hex:"#"+t.map(e=>e.toString(16).padStart(2,"0")).join(""),alpha:isNaN(o)?1:o}}return null}function Wt(e,t){if(t>=1)return e;const i=Ut(e);if(!i)return e;const[s,o,a]=[1,3,5].map(e=>parseInt(i.hex.slice(e,e+2),16));return`rgba(${s}, ${o}, ${a}, ${Math.max(0,Math.round(1e3*t)/1e3)})`}function qt(e){const t=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!t)return{h:0,s:0,v:0};const i=parseInt(t[1].slice(0,2),16)/255,s=parseInt(t[1].slice(2,4),16)/255,o=parseInt(t[1].slice(4,6),16)/255,a=Math.max(i,s,o),n=a-Math.min(i,s,o);let r=0;return n>0&&(r=a===i?(s-o)/n%6:a===s?(o-i)/n+2:(i-s)/n+4,r=(60*r+360)%360),{h:r,s:0===a?0:n/a,v:a}}function Gt(e,t,i){const s=i*t,o=s*(1-Math.abs(e/60%2-1)),a=i-s,[n,r,l]=e<60?[s,o,0]:e<120?[o,s,0]:e<180?[0,s,o]:e<240?[0,o,s]:e<300?[o,0,s]:[s,0,o];return"#"+[n,r,l].map(e=>Math.round(255*(e+a)).toString(16).padStart(2,"0")).join("")}function Vt(e,t){if(1===e.length)return e[0];const i=e.map(e=>/^#[0-9a-f]{6}$/i.test(e)?[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)):null);if(i.some(e=>!e))return e[e.length-1];const s=Math.min(1,Math.max(0,t))*(e.length-1),o=Math.min(e.length-2,Math.floor(s)),a=s-o,n=i[o],r=i[o+1],l=n.map((e,t)=>Math.round(e+(r[t]-e)*a));return"#"+l.map(e=>e.toString(16).padStart(2,"0")).join("")}function Yt(e,t){const i=Ht.find(t=>t.key===e),s=t.gradients?.[e],o=Array.isArray(s)?s.filter(e=>"string"==typeof e&&e):void 0;if(o&&o.length>=2)return o;const a=t.colors?.[e];if("string"==typeof a&&a)return[a];if(i?.stops)return i.stops;const n=wi.find(t=>t.key===e)?.defaultColor;return["power"===e?t.accent:n??t.accent]}function Kt(e){const t=(e.model??"").toLowerCase(),i=new Set(e.entities.map(e=>e.domain));let s;if(i.has("climate")&&i.has("switch")&&e.isShelly)s="wall_display";else if(i.has("climate"))s="climate";else if(i.has("cover"))s="cover";else if(i.has("valve"))s="valve";else if(i.has("lock"))s="lock";else if(i.has("media_player"))s="media";else if(i.has("light")){const t=e.entities.some(e=>{if("light"!==e.domain)return!1;return(e.attributes?.supported_color_modes??[]).some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))});s=t?"rgb":"dimmer"}else if(!e.entities.some(e=>"event"===e.domain&&"button"===e.attributes?.device_class)||e.entities.some(e=>"switch"===e.domain&&/_(switch|relay)_\d/.test(e.entity_id))||e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","carbon_dioxide","illuminance","pressure","moisture"].includes(e.attributes?.device_class??"")))if(i.has("switch"))s=t.includes("uni")?"uni":!t.includes("plug")&&(e.entities.some(e=>"binary_sensor"===e.domain&&e.entity_id.includes("input"))||t.includes("1pm")||t.includes("2pm")||t.includes("pro "))?"relay":"plug";else{const t=e.entities.some(e=>"sensor"===e.domain&&("power"===e.attributes?.device_class||"energy"===e.attributes?.device_class||"apparent_power"===e.attributes?.device_class)),i=e.entities.some(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||e.entity_id.includes("channel")||null==e.attributes?.device_class)||"event"===e.domain&&("button"===e.attributes?.device_class||e.entity_id.includes("channel")||e.entity_id.includes("input"))),o=e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","illuminance","moisture","battery","gas"].includes(e.attributes?.device_class??"")),a=e.entities.some(e=>"binary_sensor"===e.domain&&["motion","door","window","moisture","smoke","gas","vibration","opening"].includes(e.attributes?.device_class??""));s=t?"energy":!i||o||a?"sensor":"input"}else s="input";return s}const Xt=new Set(["relay","plug","energy","sensor","input","uni","generic","media","lock"]),Qt={id:"shelly",matches:e=>e.isShelly,detect:e=>{let t=Kt(e);if(Xt.has(t)){const i=function(e){if(e)for(const t of Lt)if(t.match.test(e))return t.profile}(e.model);i&&(t=i)}return{type:t,gen:ti(e.model??"",e.hw_version,e.model_id),label:Dt[t],integration:e.integration}}},Zt={id:"generic",matches:()=>!0,detect:e=>{const t=Kt(e);return{type:t,gen:"other",label:"climate"===t?"Climate":"relay"===t?"Switch":Dt[t],integration:e.integration}}},Jt=[Qt,Zt];function ei(e){for(const t of Jt)if(t.matches(e))return t.detect(e);return Zt.detect(e)}function ti(e,t,i){const s=e.toLowerCase(),o=/^gen\s*([1-9])$/i.exec((t??"").trim());if(o){const e=Number(o[1]);if(e>=1&&e<=4)return e}const a=(i??"").toUpperCase();return/^SB/.test(a)?"ble":/^S4/.test(a)?4:/^S3/.test(a)?3:/^S[NA]/.test(a)?2:/^SH/.test(a)?1:!s.includes("blu")&&!s.includes("bluetooth")||s.includes("gateway")?s.includes("g4")||s.includes("gen4")||s.includes("gen 4")?4:s.includes("g3")||s.includes("gen3")||s.includes("gen 3")||/^s3/i.test(e)?3:s.includes("plus")||s.includes("pro")||/^sn/i.test(e)?2:"other":"ble"}const ii={shelly:"Shelly",bthome:"BTHome",zha:"Zigbee",zwave_js:"Z-Wave",mqtt:"MQTT",z2m:"Z2M",zigbee2mqtt:"Z2M",hue:"Hue",deconz:"deCONZ",matter:"Matter",homekit:"HomeKit",tuya:"Tuya",tplink:"Kasa",esphome:"ESPHome",wled:"WLED",tasmota:"Tasmota",konnected:"Konnected",nest:"Nest",ring:"Ring",lifx:"LIFX",nanoleaf:"Nanoleaf",sonos:"Sonos",music_assistant:"Music",spotify:"Spotify",spotifyplus:"Spotify",cast:"Cast",yamaha_musiccast:"Yamaha",androidtv_remote:"Android",philips_js:"Philips",roborock:"Roborock",reolink:"Reolink",gecko:"Gecko",upnp:"UPnP",ipp:"Printer",bermuda:"Bermuda",template:"Template",device_pulse:"Pulse"};function si(e){return ii[e.toLowerCase()]??e.toUpperCase().slice(0,6)}function oi(e){const t=e.entities??{},i=new Set,s=new Set;for(const[e,o]of Object.entries(t)){if(!o?.device_id||o.hidden_by)continue;const t=e.split(".")[0];if(!xt.has(t))continue;s.add(t);const a=(o.platform??"").toLowerCase();a&&i.add(a)}return{integrations:[...i].sort((e,t)=>si(e).localeCompare(si(t))),domains:[...s].sort()}}const ai="—";function ni(e){return Number.isFinite(e)?e>=1e3?`${(e/1e3).toFixed(2)} kW`:`${e.toFixed(1)} W`:ai}function ri(e){return Number.isFinite(e)?`${e.toFixed(3)} kWh`:ai}function li(e){return Number.isFinite(e)?`${e.toFixed(1)} V`:ai}function ci(e){return Number.isFinite(e)?`${e.toFixed(3)} A`:ai}function di(e){return Number.isFinite(e)?`${e.toFixed(1)} °C`:ai}function pi(e){return!Number.isFinite(e)||e<0?ai:e<60?`${Math.floor(e)}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}function hi(e){return Number.isFinite(e)?e>=-50?"Excellent":e>=-60?"Good":e>=-70?"Fair":"Poor":ai}function ui(e){return Number.isFinite(e)?`${e.toFixed(1)} VA`:ai}function gi(e){return Number.isFinite(e)?`${e.toFixed(1)} VAr`:ai}function vi(e){return Number.isFinite(e)?`${e.toFixed(2)} Hz`:ai}function fi(e){return Number.isFinite(e)?`${e.toFixed(1)} %`:ai}function mi(e){return Number.isFinite(e)?e>=1e4?`${(e/1e3).toFixed(1)} klx`:`${Math.round(e)} lx`:ai}function bi(e){return Number.isFinite(e)?`${Math.round(e)} ppm`:ai}function yi(e){return Number.isFinite(e)?`${Math.round(e)} %`:ai}function xi(e,t){if(!Number.isFinite(e))return ai;const i=Math.abs(e)>=1e3?Math.round(e):parseFloat(e.toFixed(2));return t?`${i} ${t}`:`${i}`}const wi=[{key:"power",label:"Power",unit:"W",group:"Electrical",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",group:"Electrical",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",group:"Electrical",defaultColor:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",group:"Electrical",defaultColor:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",group:"Electrical",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",group:"Electrical",defaultColor:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",group:"Electrical",defaultColor:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",group:"Electrical",defaultColor:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",group:"Environmental",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",group:"Environmental",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",group:"Environmental",defaultColor:"#fde047"},{key:"carbon_dioxide",label:"CO₂",unit:"ppm",group:"Environmental",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",group:"Environmental",defaultColor:"#fb923c"},{key:"battery",label:"Battery",unit:"%",group:"Device",defaultColor:"#86efac"},{key:"signal_strength",label:"RSSI",unit:"dBm",group:"Device",defaultColor:"#7dd3fc"}],_i=Object.fromEntries(wi.map(e=>[e.key,e.label.split(" ")[0]])),ki={co2:"carbon_dioxide",rssi:"signal_strength"};function Ai(e){return ki[e]??e}function Si(e){if(!e)return e;let t=!1,i=e.graph_sensors;if(Array.isArray(i)){const e=new Set,s=i.map(Ai).filter(t=>!e.has(t)&&(e.add(t),!0));(s.length!==i.length||s.some((e,t)=>e!==i[t]))&&(i=s,t=!0)}let s=e.graph_sensor_colors;if(s&&"object"==typeof s){let e=!1;const i={};for(const[t,o]of Object.entries(s)){const s=Ai(t);s!==t&&(e=!0),s in i||(i[s]=o)}e&&(s=i,t=!0)}let o=e.style,a=e.theme;if(o&&"object"==typeof o){const e=Ve(o);if("custom"!==e&&(void 0===a||a===e)){const i={...o};for(const e of Ge)delete i[e];Object.keys(i).length!==Object.keys(o).length&&(o=Object.keys(i).length?i:void 0,a=e,t=!0)}}const n=e;let r,l=!1;if(n.elements&&"object"==typeof n.elements){let e=n.tile_style;"string"==typeof e&&e.startsWith("custom:")&&(e=n.custom_styles?.[e.slice(7)]?.base??"default");const i=e&&{hero:"power-monitor",ring:"power-monitor",spark:"power-monitor",hbar:"power-monitor",list:"power-monitor",command:"scene-button"}[e]||e;if(i&&Pt[i]){const e={...n.style_presets?.[i]??{}};e.elements={...n.elements,...e.elements??{}},r={...n.style_presets??{},[i]:e}}l=!0,t=!0}const c=e;let d=!1;const p=e=>{if(!Array.isArray(e))return e;if(e.some(e=>Array.isArray(e))){let t=!1;const i=e.map(e=>Array.isArray(e)&&e.includes("delegated_controls")&&!e.includes("media_controls")?(t=!0,e.flatMap(e=>"delegated_controls"===e?["media_controls",e]:[e])):e);return t?(d=!0,i):e}return!e.includes("delegated_controls")||e.includes("media_controls")?e:(d=!0,e.flatMap(e=>"delegated_controls"===e?["media_controls",e]:[e]))},h=e=>{if(!e)return e;let t=!1;const i={};for(const[s,o]of Object.entries(e)){const e=p(o?.tile_layout);o&&e!==o.tile_layout?(i[s]={...o,tile_layout:e},t=!0):i[s]=o}return t?i:e},u=p(c.tile_layout),g=h(c.device_styles),v=h(c.profile_styles),f=h(c.area_styles),m=h(c.custom_styles),b=h(c.style_presets);let y=c.views;if(Array.isArray(y)){let e=!1;const t=y.map(t=>{const i=p(t?.tile_layout);return t&&i!==t.tile_layout?(e=!0,{...t,tile_layout:i}):t});e&&(y=t)}if(d&&(t=!0),!t)return e;const x={...e};if(d){const e=x;u!==c.tile_layout&&(e.tile_layout=u),g!==c.device_styles&&(e.device_styles=g),v!==c.profile_styles&&(e.profile_styles=v),f!==c.area_styles&&(e.area_styles=f),m!==c.custom_styles&&(e.custom_styles=m),b!==c.style_presets&&(e.style_presets=b),y!==c.views&&(e.views=y)}return o!==e.style&&(void 0===o?delete x.style:x.style=o),a!==e.theme&&(x.theme=a),i&&(x.graph_sensors=i),s&&(x.graph_sensor_colors=s),l&&(delete x.elements,r&&(x.style_presets=r)),x}const Ci=[{key:"online",label:"Online",agg:"count"},{key:"offline",label:"Offline",agg:"count"},{key:"power",label:"Power",agg:"sum"},{key:"energy",label:"Energy",agg:"sum"},{key:"temperature",label:"Temperature",agg:"avg"},{key:"humidity",label:"Humidity",agg:"avg"},{key:"illuminance",label:"Lux",agg:"avg"},{key:"lights",label:"Lights",agg:"count"},{key:"rssi",label:"Wi-Fi",agg:"avg"},{key:"alerts",label:"Alerts",agg:"count"},{key:"updates",label:"Updates",agg:"count"}],$i=["online","offline","power","alerts"],Ei=[{key:"power",label:"Power",dc:"power",agg:"sum"},{key:"energy",label:"Energy",dc:"energy",agg:"sum"},{key:"voltage",label:"Volt",dc:"voltage",agg:"avg"},{key:"current",label:"Amp",dc:"current",agg:"sum"},{key:"temperature",label:"Temp",dc:"temperature",agg:"avg"},{key:"humidity",label:"Hum",dc:"humidity",agg:"avg"},{key:"co2",label:"CO₂",dc:"carbon_dioxide",agg:"avg"},{key:"illuminance",label:"Lux",dc:"illuminance",agg:"avg"},{key:"battery",label:"Batt",dc:"battery",agg:"avg"},{key:"rssi",label:"Wi-Fi",dc:"signal_strength",agg:"avg"}],Ti=["power","energy","voltage","current","temperature"],Ii=Object.freeze({theme:"warm_dusk",tile_style:"default",tile_size:"md",columns:3,sort_by:"name",smart_tile_styles:!1,graph_hours:24,header_chips:$i});function Mi(){return{...Ii,header_chips:[...Ii.header_chips??[]]}}const Di=["type","views","default_view","mode","universal_scope","include_integrations","exclude_integrations","include_domains","exclude_domains","delegate_controls","header_cards","footer_cards","area_cards","areas","hidden_devices","favorites","hidden_entities","show_offline","title","columns","tile_size","sort_by","tile_style","smart_tile_styles","power_monitor_variant","show_graphs","tile_layout","tile_opacity","card_opacity","header_opacity","header_show_title","header_show_stats","header_show_cloud","header_show_orbs","effects","header_chips","area_header_chips","show_collapse_all","card_bg_image","card_bg_image_size","show_power_bar","power_bar_max","show_entity_list","theme","light_labels","light_entities","show_attention","attention_battery","show_firmware_summary","include_beta_updates","style","area_styles","device_styles","profile_styles","style_presets","custom_styles","energy_period","graph_sensors","graph_hours","graph_style","graph_line_color","radio_stations","extra_card_style","area_card_placement","devices","show_header","show_rooms","graph_sensor_colors","sensors"],Oi=["grid_options","view_layout","layout_options","visibility","card_mod"];function zi(e){if("binary_sensor"!==e.domain)return!1;if(/external_power|power_supply|charging/.test(e.entity_id))return!1;if(/(?:input|channel|button)/i.test(e.entity_id))return!0;const t=e.attributes?.device_class;return null==t||"power"===t}function Pi(e){return"event"===e.domain&&("button"===e.attributes?.device_class||/(?:input|channel|button)/i.test(e.entity_id))}function Ri(e){const t=e.match(/(?:input|channel|button)[_\s]*(\d+)/i);return t?parseInt(t[1],10):null}function Bi(e,t,i){if("input"===i||"uni"===i)return;const s=e.entities.filter(e=>("switch"===e.domain||"light"===e.domain)&&!e.entity_category);if(s.length){if(1===s.length)return s[0].entity_id;if(null!=t){const e=s.find(e=>function(e){const t=e.match(/(?:switch|relay|light|channel)[_\s]*(\d+)/i);return t?parseInt(t[1],10):null}(e.entity_id)===t);if(e)return e.entity_id}}}function Li(e,t){const i=(e??"").trim(),s=(t??"").trim();return s&&i.toLowerCase().startsWith(s.toLowerCase())?i.slice(s.length).trim():i}function Fi(e,t,i,s){const o=Li(e,t);return o||(null!=i?`Input ${i}`:s.split(".")[1]??s)}function Ni(e,t){const i=e.entities.filter(zi),s=e.entities.filter(Pi),o=new Set,a=[],n=i.length||s.length?ei(e).type:"generic";return i.forEach((i,r)=>{const l=t[i.entity_id],c=Ri(i.entity_id),d=((e,t)=>{const i=e.entity_id.replace(/^binary_sensor\./,""),a=s.find(e=>!o.has(e.entity_id)&&e.entity_id.replace(/^event\./,"")===i);return a||(null!=t?s.find(e=>!o.has(e.entity_id)&&Ri(e.entity_id)===t):void 0)})(i,c);d&&o.add(d.entity_id);const p=d?t[d.entity_id]:null,h=p?.attributes?.event_type;a.push({entityId:i.entity_id,label:Fi(l?.attributes?.friendly_name??"",e.name,c,i.entity_id),isOn:"on"===l?.state,kind:d?"button":"switch",channel:c??0,lastEvent:h??null,lastChanged:l?.last_changed??null,output:Bi(e,c,n),_sort:c??50+r})}),s.filter(e=>!o.has(e.entity_id)).forEach((i,s)=>{const o=t[i.entity_id],r=Ri(i.entity_id),l=o?.state&&"unknown"!==o.state&&"unavailable"!==o.state?o.state:null;a.push({entityId:i.entity_id,label:Fi(o?.attributes?.friendly_name??"",e.name,r,i.entity_id),isOn:!1,kind:"button",channel:r??0,lastEvent:o?.attributes?.event_type??null,lastChanged:o?.last_changed??l,output:Bi(e,r,n),_sort:r??50+s})}),a.sort((e,t)=>e._sort-t._sort).map(({_sort:e,...t})=>t)}const ji=e=>e.config.device_styles?.[e.device.device_id],Hi=e=>e.config.profile_styles?.[e.profile],Ui=e=>e.device.area?e.config.area_styles?.[e.device.area]:void 0,Wi={hero:"big-number",ring:"gauge",spark:"graph",hbar:"compact",list:"table"};function qi(e){return ji(e)?.tile_style??Hi(e)?.tile_style??Ui(e)?.tile_style??e.view?.tile_style??e.config.tile_style??(e.config.smart_tile_styles?zt(e.profile,e.device):void 0)}function Gi(e,t){if("string"==typeof t&&t.startsWith("custom:")){const i=e.custom_styles?.[t.slice(7)];return{base:i?.base??"default",custom:i}}return{base:t}}function Vi(e){return e&&e in Wi?{style:"power-monitor",variant:Wi[e]}:"command"===e?{style:"scene-button",variant:"big-number"}:{style:e??"default",variant:"big-number"}}const Yi=e=>Gi(e.config,qi(e)).custom;function Ki(e){const{base:t}=Gi(e.config,qi(e));return Vi(t).style}function Xi(e,t){const i=Ki(e);return ji(e)?.elements?.[t]??Hi(e)?.elements?.[t]??Ui(e)?.elements?.[t]??e.view?.elements?.[t]??Yi(e)?.elements?.[t]??e.config.style_presets?.[i]?.elements?.[t]??function(e,t){return Pt[e]?.find(e=>e.id===t)?.def??!0}(i,t)}function Qi(e,t,i){return t?.[i]??e[i]}function Zi(e,t){return t?.extra_card_style??e.extra_card_style??"ha"}function Ji(e,t,i){return i?.columns??t?.columns??e.columns??3}function es(e,t){const i=e=>e&&"custom"!==e?e:void 0;return i(t?.theme)??i(e?.theme)}const ts=new Set(["unavailable","unknown"]),is=e=>!e.borrowed_from;function ss(e){return e.entities.some(e=>e.borrowed_from)?{...e,entities:e.entities.filter(is)}:e}function os(e,t){return e.entities.some(e=>{if(!is(e))return!1;const i=t[e.entity_id];return!!i&&!ts.has(i.state??"")})}function as(e,t){const i=[];for(const s of e.entities){if("binary_sensor"!==s.domain||!is(s))continue;const e=t[s.entity_id];if(!e||"on"!==e.state)continue;const o=e.attributes?.device_class??"";"heat"===o||s.entity_id.includes("overtemp")?i.push("overtemp"):("safety"===o||s.entity_id.includes("overpower"))&&i.push("overpower")}return[...new Set(i)]}function ns(e,t){const i=[];for(const s of e.entities){if("binary_sensor"!==s.domain||!is(s))continue;const e=t[s.entity_id];if(!e||"on"!==e.state)continue;const o=e.attributes?.device_class??"";"smoke"===o?i.push("smoke"):"moisture"===o?i.push("water"):"gas"===o&&i.push("gas")}return[...new Set(i)]}function rs(e,t){return[...as(e,t),...ns(e,t)]}function ls(e,t,i={}){const s=ps(e,t,i);return!!s&&!!s.next&&s.next!==s.current}function cs(e,t){let i=null;for(const s of e.entities){if("sensor"!==s.domain||!is(s))continue;const e=t[s.entity_id];if(!e||"battery"!==e.attributes?.device_class)continue;const o=parseFloat(e.state??"");isNaN(o)||(i=null===i?o:Math.min(i,o))}return i}function ds(e,t){return/beta/i.test(e)||/beta/i.test(t?.friendly_name??"")}function ps(e,t,i={}){for(const s of e.entities){if("update"!==s.domain||!is(s))continue;const e=t[s.entity_id];if(e&&"on"===e.state&&(i.includeBeta||!ds(s.entity_id,e.attributes)))return{entityId:s.entity_id,current:e.attributes?.installed_version??"",next:e.attributes?.latest_version??""}}return null}function hs(e,t,i={}){const s=new Set(i.labels??[]),o=new Set(i.entities??[]);let a=0,n=0;const r=[],l=new Set,c=(e,i)=>{if(l.has(e))return;const s=t[e];s&&!ts.has(s.state??"")&&(l.add(e),n++,"on"===s.state&&(a++,r.push(s.attributes?.friendly_name??i)))};for(const t of e){const e=!!t.labels?.some(e=>s.has(e));for(const i of t.entities)("light"===i.domain||o.has(i.entity_id)||e&&"switch"===i.domain)&&c(i.entity_id,t.name)}for(const e of o)c(e,e);return{on:a,total:n,onNames:r}}function us(e){const t=new Map;for(const i of e){const e=i.sw_version;if(null==e||""===e)continue;const s=gs(e);t.has(s)||t.set(s,[]),t.get(s).push(i)}const i=[...t.entries()].map(([e,t])=>({version:e,devices:t,current:!1})).sort((e,t)=>function(e,t){const i=e.split(".").map(e=>parseInt(e,10)),s=t.split(".").map(e=>parseInt(e,10));for(let o=0;o<Math.max(i.length,s.length);o++){const a=i[o]??0,n=s[o]??0;if(isNaN(a)||isNaN(n))return e.localeCompare(t);if(a!==n)return a-n}return 0}(t.version,e.version));return i.length&&(i[0].current=!0),i}function gs(e){const t="string"==typeof e?e:String(e??""),i=t.match(/(\d+\.\d+(?:\.\d+)?)/);return i?i[1]:t}function vs(e){return e.includes(".")}function fs(e){return e.filter(e=>!vs(e))}function ms(e){return e.filter(vs)}function bs(e,t){if(!t?.length)return[];const i=new Map(e.entities.map(e=>[e.entity_id,e])),s=[];for(const e of ms(t)){const t=i.get(e);t&&!s.includes(t)&&s.push(t)}return s}function ys(e,t){return[...ms(e??[]),...t]}const xs=["temperature","humidity","carbon_dioxide","illuminance","battery"],ws=["motion","door","window","moisture","smoke","gas"],_s=(e,t)=>e[t]?.attributes??{};function ks(e,t){return As(e,t)&&!e.entity_category}function As(e,t){if("sensor"!==e.domain)return!1;const i=t[e.entity_id];return!(!i||"unavailable"===i.state||"unknown"===i.state)&&(!!_s(t,e.entity_id).unit_of_measurement&&!isNaN(parseFloat(i.state)))}function Ss(e){const{device:t,accent:i,online:s,hass:o,config:a}=e,n=e.sensorSelection(t),r=function(e,t,i){for(const s of bs(e,i))if(As(s,t))return s;const s=i=>{for(const s of xs){const o=e.entities.find(e=>i(e)&&_s(t,e.entity_id).device_class===s);if(o)return o}},o=s(e=>ks(e,t));if(o)return o;const a=e.entities.find(e=>ks(e,t));return a||s(e=>As(e,t))}(t,o.states,n),l=r?void 0:function(e,t){return e.entities.find(e=>"binary_sensor"===e.domain&&t[e.entity_id]&&ws.includes(_s(t,e.entity_id).device_class??""))}(t,o.states);if(!r&&!l)return nt(t,s,"ts-sensor",it("empty.no_sensor"));if(r){const l=o.states[r.entity_id],c=parseFloat(l?.state??""),d=l?.attributes?.unit_of_measurement??"",p=l?.attributes?.device_class??"",h=a.graph_hours??24;e.requestGraphData(r.entity_id);const u=e.getGraphPoints(r.entity_id,h);let g=0;if(u.length>=2){const e=Math.floor(u.length/2),t=u.slice(e).reduce((e,t)=>e+t.v,0)/(u.length-e),i=u.slice(0,e).reduce((e,t)=>e+t.v,0)/e;g=t-i}const v=function(e,t,i,s=4,o){const a=bs(e,o).filter(e=>e.entity_id!==i&&As(e,t)),n=new Set(a.map(e=>e.entity_id)),r=e.entities.filter(e=>e.entity_id!==i&&!n.has(e.entity_id)&&ks(e,t));return[...a,...r].slice(0,s)}(t,o.states,r.entity_id,4,n),f=ot(e),m=!f&&e.showEl("secondary"),b=new Set(bs(t,n).map(e=>e.entity_id)),y=v.some(e=>b.has(e.entity_id)),x=(f||m)&&v.length?v.map(e=>{const i=o.states[e.entity_id],s=i?.attributes,a=parseFloat(i?.state??""),n=s?.unit_of_measurement??"";if(!y)return q`<span class="ts-chip">${isNaN(a)?i?.state:a.toFixed(1)} ${n}</span>`;const r=Li(s?.friendly_name??"",t.name)||e.entity_id.split(".")[1]?.replace(/_/g," ")||e.entity_id;return q`<span class="ts-chip" title=${r}>
        <span class="ts-chip-lbl">${r}</span>${isNaN(a)?i?.state:xi(a,n)}</span>`}):null;return q`
      <div class="ts-sensor" style="--ts-accent:${i}">
        <div class="ts-sensor-top">
          ${at(t,s)}
          ${f&&x?q`<div class="ts-chips ts-chips-hdr">${x}</div>`:Y}
          <span class="ts-sensor-dc">${p}</span>
        </div>
        ${e.showEl("primary_value")?q`<div class="ts-sensor-main">
          <span class="ts-sensor-val" style="color:${i}">${isNaN(c)?l?.state:c%1==0?c:c.toFixed(1)}</span>
          <span class="ts-sensor-unit">${d}</span>
        </div>`:Y}
        ${e.showEl("trend")&&u.length>=2?q`
          <div class="ts-sensor-trend ${g>0?"up":g<0?"down":""}">
            ${g>0?"↑":g<0?"↓":"→"} ${Math.abs(g)<.05?"stable":Math.abs(g).toFixed(1)+" "+d+"/hr"}
          </div>`:Y}
        ${e.showEl("graph")?(()=>{const i=e.getGraphSensors(t),s=[...i.filter(e=>e.entityId===r.entity_id),...i.filter(e=>e.entityId!==r.entity_id)];return q`<div class="ts-sensor-spark">${e.renderSparklinesFiltered(t,s)}</div>`})():Y}
        ${m&&x?q`<div class="ts-chips" style="margin-top:6px">
          ${x}
        </div>`:Y}
      </div>`}const c=o.states[l.entity_id],d="on"===c?.state,p=c?.attributes?.device_class??"",h=it(d?"motion"===p?"state.motion":"moisture"===p?"state.flooded":"smoke"===p?"state.smoke":"state.open":"motion"===p?"state.clear":"moisture"===p?"state.dry":"smoke"===p?"state.clear":"state.closed"),u=d?"#f87171":"var(--sc-online-color)",g=c?.last_changed?e.timeAgo(c.last_changed):"";return q`
    <div class="ts-sensor" style="--ts-accent:${i}">
      <div class="ts-sensor-top">
        ${at(t,s)}
        <span class="ts-sensor-dc">${p}</span>
      </div>
      ${e.showEl("primary_value")?q`<div class="ts-sensor-binary-state" style="color:${u}">
        <span class="ts-sensor-binary-dot" style="background:${u}"></span>
        ${h}
      </div>`:Y}
      ${g?q`<div style="font-size:.7em;color:var(--sc-text-muted);margin-top:4px">${g}</div>`:Y}
    </div>`}function Cs(e,t){switch(t){case"gauge":return function(e){const{device:t,isOn:i,accent:s,online:o,config:a}=e,n=e.tileSensors(t),r=e.getPrimarySwitch(t),l=function(e,t){const i=[];for(const s of Ht){const o=e[s.key];if(null==o)continue;const a=o.value,n=t.ranges?.[s.key]??{},r=o.diagnostic&&s.diag?s.diag:s,l=n.min??r.min,c=n.max??r.max,d=Yt(s.key,t),p=Math.min(1,Math.max(0,(a-l)/(c-l||1)));if(i.push({key:s.key,label:s.label,val:a,digits:s.digits,min:l,max:c,stops:d,pct:p,color:Vt(d,p)}),i.length>=4)break}return i}(e.sensorValues(t),{ranges:a.graph_style?.sensor_ranges,colors:a.graph_sensor_colors,gradients:a.graph_style?.gauge_gradients,accent:s}),c=e=>`pm-gg-${t.device_id.replace(/\W/g,"")}-${e}`,d=new Set(["power","voltage","current"]),p=110,h=110,u=180,g=180,v=22,f=102,m=e=>e*Math.PI/180,b=(e,t)=>{const i=g+u*Math.min(1,Math.max(0,t)),s=p+e*Math.cos(m(g)),o=h+e*Math.sin(m(g)),a=p+e*Math.cos(m(i)),n=h+e*Math.sin(m(i)),r=u*t>180?1:0;return`M ${s.toFixed(2)} ${o.toFixed(2)} A ${e} ${e} 0 ${r} 1 ${a.toFixed(2)} ${n.toFixed(2)}`},y=(e,t,i)=>"power"===t&&e>=1e3?`${(e/1e3).toFixed(1)}k`:e.toFixed(i),x=7,w=h+8;return q`
    <div class="ts-ring" style="--ts-accent:${s};align-items:center">
      <div class="ts-ring-top" style="width:100%">
        ${r&&e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(r.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
        ${at(t,o,"ts-ring-name")}
        ${ot(e)?Es(n,"ts-chips ts-chips-hdr"):Y}
      </div>
      ${l.length?q`
      <svg viewBox="0 0 ${2*p} ${w}" style="width:100%;max-width:360px;height:auto;overflow:visible;display:block">
        <defs>
          ${l.map((e,t)=>{if(e.stops.length<2)return Y;const i=f-t*v;return G`
              <linearGradient id="${c(e.key)}" gradientUnits="userSpaceOnUse"
                x1="${p-i}" y1="0" x2="${p+i}" y2="0">
                ${e.stops.map((t,i)=>G`<stop offset="${i/(e.stops.length-1)*100}%" stop-color="${t}"/>`)}
              </linearGradient>`})}
        </defs>
        ${l.map((e,t)=>{const s=f-t*v,o=e.stops.length>1?`url(#${c(e.key)})`:e.stops[0],a=18,n=(h-Math.sqrt(Math.max(0,s*s-a*a))+x/2+1.5).toFixed(1),r=i||!d.has(e.key);return G`
            <path d="${b(s,1)}"        fill="none" stroke="${o}" stroke-width="${x}" stroke-linecap="round" opacity="0.12"/>
            <path d="${b(s,e.pct)}" fill="none" stroke="${o}" stroke-width="${x}" stroke-linecap="round" opacity="${r?"0.9":"0.3"}"/>
            <text x="${p}" y="${n}" font-size="8" fill="${e.color}" text-anchor="middle" dominant-baseline="hanging" font-family="monospace" font-weight="700" opacity="${r?.95:.5}">${y(e.val,e.key,e.digits)} ${e.label}</text>`})}
      </svg>`:q`<span style="color:var(--sc-text-muted);font-size:.8em">${it("empty.no_gauge_readings")}</span>`}
      ${$s(e)}
    </div>`}(e);case"graph":return function(e){const{device:t,isOn:i,accent:s,online:o,config:a}=e,n=e.tileSensors(t),r=e.getPrimarySwitch(t),l=ot(e);e.ensureGraphData(t);const c=e.getPowerSparks(t),d=200,p=48,h=3,u=a.graph_style?.line_width??1.5,g=i?s:"var(--sc-text-muted)";let v=0,f=p-h;const m=c.length>1?(()=>{const e=c.map(e=>e.v),i=c.filter(e=>!e.live).map(e=>e.v),s=a.graph_style?.sensor_ranges?.power??{},o=s.min??Math.min(...i),n=s.max??Math.max(...i),r=n-o||1,l=(e,t)=>t/(c.length-1)*d,m=e=>p-h-(e-o)/r*(p-2*h),b=e.indexOf(n);v=l(null,Math.max(0,b)),f=m(n);const y=c.map((e,t)=>`${l(null,t).toFixed(1)},${m(e.v).toFixed(1)}`).join(" "),x=`pm-gr-${t.device_id.replace(/\W/g,"")}`;return G`<defs><linearGradient id="${x}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${g}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${g}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${y} ${d},${p-h} 0,${p-h}" fill="url(#${x})"/>
    <polyline points="${y}" fill="none" stroke="${g}" stroke-width="${u}" stroke-linecap="round"/>
    ${n>o?G`<circle cx="${v.toFixed(1)}" cy="${f.toFixed(1)}" r="3" fill="${g}"/>
      <line x1="${v.toFixed(1)}" x2="${v.toFixed(1)}" y1="${f.toFixed(1)}" y2="${p}" stroke="${g}" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4"/>`:Y}`})():Y;return q`
    <div class="ts-spark" style="--ts-accent:${s}">
      <div class="ts-spark-top">
        ${r&&e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(r.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
        ${at(t,o,"ts-spark-name")}
        ${l?Es(n,"ts-chips ts-chips-hdr"):Y}
      </div>
      ${e.showEl("graph")?q`<div class="ts-spark-graph"><svg viewBox="0 0 ${d} ${p}" preserveAspectRatio="none" style="width:100%;height:${p}px;display:block;overflow:visible">${m}</svg></div>`:Y}
      <div class="ts-spark-bottom">
        <div>
          <div class="ts-spark-big" style="color:${i?s:"var(--sc-text-muted)"}">${null!=n.power?n.power.toFixed(n.power<10?1:0):"—"}</div>
          <div class="ts-spark-sub">${i?"W · now":"W · idle"}</div>
        </div>
        ${!l&&e.showEl("secondary")?q`<div class="ts-spark-meta">
          ${null!=n.voltage?q`<div class="ts-spark-mrow">${n.voltage.toFixed(1)} <b>V</b></div>`:Y}
          ${null!=n.current?q`<div class="ts-spark-mrow">${n.current.toFixed(2)} <b>A</b></div>`:Y}
          ${null!=n.energy?q`<div class="ts-spark-mrow">${n.energy.toFixed(2)} <b>kWh</b></div>`:Y}
          ${null!=n.temp?q`<div class="ts-spark-mrow">${n.temp.toFixed(1)} <b>°C</b></div>`:Y}
          ${null!=n.rssi?q`<div class="ts-spark-mrow">${n.rssi} <b>dBm</b></div>`:Y}
        </div>`:Y}
      </div>
      ${$s(e,{skipPowerGraph:!0})}
    </div>`}(e);case"compact":return function(e){const{device:t,isOn:i,accent:s,online:o}=e,a=e.tileSensors(t),n=e.getPrimarySwitch(t),r=ot(e);return q`
    <div class="ts-hbar" style="--ts-accent:${s}">
      <div class="ts-hbar-top">
        <div class="ts-hbar-left-bar" style="background:${i?s:"rgba(255,255,255,0.07)"}"></div>
        <div class="ts-hbar-main">
          ${r?q`
            <div class="ts-hbar-namerow">
              ${at(t,o,"ts-hbar-name")}
              ${Es(a,"ts-chips ts-chips-hdr")}
            </div>`:at(t,o,"ts-hbar-name")}
          <div class="ts-hbar-num" style="color:${i?s:"var(--sc-text-muted)"}">${null!=a.power?a.power.toFixed(a.power<10?1:0):"—"}</div>
          <div class="ts-hbar-unit">watts</div>
        </div>
        ${!r&&e.showEl("secondary")?q`<div class="ts-hbar-side">
          ${null!=a.voltage?q`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">V</div><div class="ts-hbar-sv">${a.voltage.toFixed(0)}</div></div>`:Y}
          ${null!=a.current?q`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">A</div><div class="ts-hbar-sv">${a.current.toFixed(2)}</div></div>`:Y}
          ${null!=a.temp?q`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">°C</div><div class="ts-hbar-sv">${a.temp.toFixed(1)}</div></div>`:Y}
          ${null!=a.rssi?q`<div class="ts-hbar-sstat"><div class="ts-hbar-sk">dBm</div><div class="ts-hbar-sv">${a.rssi}</div></div>`:Y}
        </div>`:Y}
      </div>
      <div class="ts-hbar-footer">
        <div style="display:flex;gap:6px;align-items:center">
          ${null!=a.energy?q`<span class="ts-hbar-badge">${a.energy.toFixed(2)} kWh</span>`:Y}
          ${null!=a.uptime&&e.showEl("uptime")?q`<span class="ts-hbar-badge">${pi(a.uptime)}</span>`:Y}
        </div>
        ${n&&e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(n.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
      </div>
      ${$s(e)}
    </div>`}(e);case"table":return function(e){const{device:t,isOn:i,accent:s,online:o,config:a}=e,n=e.tileSensors(t),r=e.getPrimarySwitch(t),l=ot(e);e.ensureGraphData(t);const c=e.getPowerSparks(t),d=200,p=24,h=2,u=a.graph_style?.line_width??1.5,g=i?s:"var(--sc-text-muted)",v=c.length>1?(()=>{const e=c.filter(e=>!e.live).map(e=>e.v),i=a.graph_style?.sensor_ranges?.power??{},s=i.min??Math.min(...e),o=(i.max??Math.max(...e))-s||1,n=c.map((e,t)=>`${(t/(c.length-1)*d).toFixed(1)},${(p-h-(e.v-s)/o*(p-2*h)).toFixed(1)}`).join(" "),r=`pm-tbl-${t.device_id.replace(/\W/g,"")}`;return G`<defs><linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${g}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${g}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${n} ${d},${p-h} 0,${p-h}" fill="url(#${r})"/>
    <polyline points="${n}" fill="none" stroke="${g}" stroke-width="${u}" stroke-linecap="round"/>`})():Y,f=(e,t,i=!1)=>q`
    <div class="ts-list-row">
      <span class="ts-list-label">${e}</span>
      <span class="ts-list-val" style="${i?`color:${s}`:""}">${t}</span>
    </div>`;return q`
    <div class="ts-list" style="--ts-accent:${s}">
      <div class="ts-list-header">
        ${r&&e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(r.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
        ${at(t,o,"ts-list-name")}
        ${l?Es(n,"ts-chips ts-chips-hdr"):Y}
      </div>
      ${null!=n.power?f(it("pm.power"),ni(n.power),!0):Y}
      ${!l&&e.showEl("secondary")?q`
        ${null!=n.voltage?f(it("pm.voltage"),`${n.voltage.toFixed(1)} V`):Y}
        ${null!=n.current?f(it("pm.current"),`${n.current.toFixed(3)} A`):Y}
        ${null!=n.energy?f(n.energyLabel,ri(n.energy)):Y}
        ${null!=n.temp?f(it("pm.temperature"),`${n.temp.toFixed(1)} °C`):Y}
        ${null!=n.rssi?f(it("pm.rssi"),`${n.rssi} dBm`):Y}`:Y}
      ${null!=n.uptime&&e.showEl("uptime")?f(it("pm.uptime"),pi(n.uptime)):Y}
      ${e.showEl("graph")?q`<div class="ts-list-spark">
        <svg viewBox="0 0 ${d} ${p}" preserveAspectRatio="none" style="width:100%;height:${p}px;display:block">${v}</svg>
      </div>`:Y}
      ${$s(e,{skipPowerGraph:!0})}
    </div>`}(e);default:return function(e){const{device:t,isOn:i,accent:s,online:o,config:a}=e,n=e.tileSensors(t),r=e.getPrimarySwitch(t),l=e.getPowerSparks(t),c=ot(e);e.ensureGraphData(t);const d=200,p=32,h=2,u=a.graph_style?.line_width??1.5,g=i?s:"var(--sc-text-muted)",v=l.length>1?(()=>{const e=l.filter(e=>!e.live).map(e=>e.v),i=a.graph_style?.sensor_ranges?.power??{},s=i.min??Math.min(...e),o=(i.max??Math.max(...e))-s||1,n=l.map((e,t)=>`${(t/(l.length-1)*d).toFixed(1)},${(p-h-(e.v-s)/o*(p-2*h)).toFixed(1)}`).join(" "),r=`pm-bn-${t.device_id.replace(/\W/g,"")}`;return G`<defs><linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${g}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${g}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${n} ${d},${p-h} 0,${p-h}" fill="url(#${r})"/>
    <polyline points="${n}" fill="none" stroke="${g}" stroke-width="${u}" stroke-linecap="round"/>`})():Y;return q`
    <div class="ts-hero" style="--ts-accent:${s}">
      <div class="ts-hero-bar" style="background:${i?s:"var(--sc-tile-border)"}"></div>
      <div class="ts-hero-top">
        ${r&&e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(r.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
        ${at(t,o,"ts-hero-name")}
        ${c?Es(n,"ts-chips ts-chips-hdr"):Y}
      </div>
      <div class="ts-hero-num" style="color:${i?s:"var(--sc-text-muted)"}">${null!=n.power?n.power.toFixed(n.power<10?1:0):"—"}</div>
      <div class="ts-hero-unit">${it("pm.watts")} · ${it(i?"state.active":"state.idle_low")}</div>
      ${e.showEl("graph")?q`<div class="ts-hero-spark"><svg viewBox="0 0 ${d} ${p}" preserveAspectRatio="none" style="width:100%;height:${p}px;display:block">${v}</svg></div>`:Y}
      <div class="ts-hero-foot">
        ${!c&&e.showEl("secondary")?Es(n):Y}
        ${e.showEl("uptime")?q`<span class="ts-uptime">${n.uptime?pi(n.uptime):""}</span>`:Y}
      </div>
      ${$s(e,{skipPowerGraph:!0})}
    </div>`}(e)}}function $s(e,t={}){return e.showEl("lower_body")?e.renderTileLowerBody(e.device,e.profile,{...t,skipGraphs:!e.showEl("graph")}):Y}function Es(e,t="ts-chips"){return q`<div class="${t}">
    ${null!=e.voltage?q`<span class="ts-chip">${e.voltage.toFixed(1)} V</span>`:Y}
    ${null!=e.current?q`<span class="ts-chip">${e.current.toFixed(2)} A</span>`:Y}
    ${null!=e.energy?q`<span class="ts-chip" title="${e.energyLabel??it("pm.energy")}">${e.energy.toFixed(2)} kWh</span>`:Y}
    ${null!=e.temp?q`<span class="ts-chip">${e.temp.toFixed(1)} °C</span>`:Y}
    ${null!=e.rssi?q`<span class="ts-chip">${e.rssi} dBm</span>`:Y}
  </div>`}const Ts=140,Is=70;function Ms(e){const{device:t,isOn:i,accent:s,online:o,hass:a,profile:n}=e,r=e.getPrimarySwitch(t),l=e.tileSensors(t);if(!r)return q`<div class="ts-light"><span style="color:var(--sc-text-muted);font-size:.8em">${it("empty.no_light")}</span></div>`;if(r.entityId.startsWith("switch.")||"dimmer"!==n.type&&"rgb"!==n.type)return q`
      <div class="ts-light" style="--ts-accent:${s}">
        <div class="ts-light-top">
          <div class="ts-light-name"><span class="dot ${o?"online":"offline"}"></span>${t.name}</div>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;flex:1;padding:16px 0">
          ${e.showEl("toggle")?q`
            <button class="tog ${i?"on":"off"}" style="font-size:1.1em;padding:10px 28px;border-radius:24px"
              @click=${t=>e.toggle(r.entityId,i,t)}>
              ${it(i?"state.on_short":"state.off_short")}
            </button>`:Y}
        </div>
        ${null!=l.power?q`<div style="font-size:.72em;color:var(--sc-text-muted);text-align:center">${ni(l.power)}</div>`:Y}
      </div>`;const c=i?Math.max(1,r.brightness??1):0,d=!!r.colorModes?.length,p=d&&(r.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),h=d&&r.rgbColor?e.rgbToHex(...r.rgbColor):"#ffffff",u=r.whiteValue??0,g=a.states[r.entityId],v=g?.attributes??{},f=v.effect_list??[],m=v.effect??"",b=(v.supported_color_modes??[]).some(e=>"color_temp"===e),y=v.min_mireds??153,x=v.max_mireds??500,w=v.color_temp??y,_=d&&r.rgbColor?(()=>{const[e,t,i]=r.rgbColor,s=Math.max(e,t,i),o=s-Math.min(e,t,i);let a=0;o>0&&(a=s===e?((t-i)/o+6)%6:s===t?(i-e)/o+2:(e-t)/o+4);const n=0===s?0:o/s,l=(e=>e*Math.PI/180)(60*a-90);return{x:Is+62*n*Math.cos(l),y:Is+62*n*Math.sin(l)}})():null,k=`wsat-${t.device_id.replace(/\W/g,"")}`;return q`
    <div class="ts-light" style="--ts-accent:${s}" @click=${e=>e.stopPropagation()}>
      <div class="ts-light-top">
        <div class="ts-light-name"><span class="dot ${o?"online":"offline"}"></span>${t.name}</div>
        ${e.showEl("toggle")?q`<button class="tog ${i?"on":"off"}" @click=${t=>e.toggle(r.entityId,i,t)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
      </div>
      ${d&&e.showEl("color_wheel")?q`
        <div class="ts-light-wheel-wrap">
          <svg width="${Ts}" height="${Ts}" viewBox="0 0 ${Ts} ${Ts}"
            class="ts-light-wheel" @click=${e=>{if(!d||!r)return;e.stopPropagation();const t=e.currentTarget,i=t.getBoundingClientRect(),s=i.left+i.width/2,o=i.top+i.height/2,n=e.clientX-s,l=e.clientY-o,c=Math.sqrt(n*n+l*l),p=i.width/2-8;if(c>p+8){const e=t.parentElement;return void(e&&(e.classList.remove("ts-wheel-pulse"),e.offsetWidth,e.classList.add("ts-wheel-pulse")))}const h=(180*Math.atan2(l,n)/Math.PI+90+360)%360,u=Math.min(1,c/p),g=e=>{const t=(e+h/60)%6;return 1-u*Math.max(0,Math.min(t,4-t,1))},v=Math.round(255*g(5)),f=Math.round(255*g(3)),m=Math.round(255*g(1));a.callService("light","turn_on",{entity_id:r.entityId,rgb_color:[v,f,m]})}} style="cursor:crosshair">
            <defs>
              <radialGradient id="${k}">
                <stop offset="0%"   stop-color="white" stop-opacity="1"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <foreignObject x="0" y="0" width="${Ts}" height="${Ts}">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width:${Ts}px;height:${Ts}px;border-radius:50%;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);opacity:${i?1:.3}"></div>
            </foreignObject>
            <circle cx="${Is}" cy="${Is}" r="${Is}" fill="url(#${k})" opacity="${i?1:.3}"/>
            ${_?G`<circle cx="${_.x.toFixed(1)}" cy="${_.y.toFixed(1)}" r="7" fill="${h}" stroke="white" stroke-width="2" filter="drop-shadow(0 0 4px rgba(0,0,0,0.6))"/>`:Y}
          </svg>
        </div>`:Y}
      ${e.showEl("brightness")?q`<div class="ts-light-row">
        <span class="ts-light-lbl">${it("tile.brightness")}</span>
        <div style="display:flex;align-items:center;gap:6px;flex:1">
          <input type="range" class="dim-slider ts-light-slider" min="1" max="100"
            .value=${String(i?c:1)} ?disabled=${!i}
            style="--sl-color:${i?h:"var(--sc-text-muted)"}"
            @input=${e=>{const t=e.target.closest(".ts-light-row")?.querySelector(".ts-light-pct");t&&(t.textContent=`${e.target.value}%`)}}
            @change=${t=>e.setBrightness(r.entityId,parseInt(t.target.value,10))}/>
          <span class="ts-light-pct">${c}%</span>
        </div>
      </div>`:Y}
      ${b&&e.showEl("color_temp")?q`
        <div class="ts-light-row">
          <span class="ts-light-lbl">${it("tile.color_temp")}</span>
          <div style="display:flex;align-items:center;gap:6px;flex:1">
            <input type="range" class="dim-slider ts-light-slider ts-light-ct" min="${y}" max="${x}"
              .value=${String(w)} ?disabled=${!i}
              @change=${e=>{a.callService("light","turn_on",{entity_id:r.entityId,color_temp:parseInt(e.target.value,10)})}}/>
            <span class="ts-light-pct">${Math.round(1e6/w)}K</span>
          </div>
        </div>`:Y}
      ${p&&e.showEl("white")?q`
        <div class="ts-light-row">
          <span class="ts-light-lbl">${it("tile.white")}</span>
          <div style="display:flex;align-items:center;gap:6px;flex:1">
            <input type="range" class="dim-slider white-slider ts-light-slider" min="0" max="255"
              .value=${String(u)} ?disabled=${!i}
              @change=${t=>e.setColor(r.entityId,h,parseInt(t.target.value,10),!0)}/>
            <span class="ts-light-pct">${u}</span>
          </div>
        </div>`:Y}
      ${e.showEl("effects")?ht(f,m,e=>a.callService("light","turn_on",{entity_id:r.entityId,effect:e})):Y}
      ${null!=l.power&&e.showEl("power")?q`<div style="font-size:.72em;color:var(--sc-text-muted);margin-top:6px">${ni(l.power)}</div>`:Y}
      ${e.showEl("graphs")&&e.getGraphEntities(t).length?q`<div class="ts-lower-section ts-lower-graphs">${e.renderSparklines(t)}</div>`:Y}
    </div>`}function Ds(e,t){const{device:i,profile:s,config:o,hass:a,online:n}=e,r=e.getPrimarySwitch(i),l=e.getTrv(i),c=e.getCover(i),d=e.getValve(i),p=e.getAlerts(i),h=e.getFirmware(i),u=e.getPower(i),g=e.getSensors(i),v=e.getInputChannels(i),f=r?.isOn??!1,m=void 0!==r?.brightness,b=r&&m&&f?Math.max(1,r.brightness??1):0,y=!!r?.colorModes?.length,x=r?.rgbColor?e.rgbToHex(...r.rgbColor):"#ffffff",w=!!r?.colorModes?.some(e=>"rgbw"===e||"rgbww"===e),_="heat"===l?.hvacMode,k="ble"===s.gen?"BLE":"other"===s.gen?"":`G${s.gen}`,A=si(i.integration);switch(t){case"name_row":{const t=o.device_styles?.[i.device_id],s=f?t?.tile_icon:t?.tile_icon_off??t?.tile_icon;let a;if(s)a=vt(s,f,`--ent-spd:${t?.tile_icon_speed??1};--ent-size:${t?.tile_icon_size??1}`,"tile-icon");else if(d){const e=d.position??("open"===d.state?100:0),t=e>66?"water2":e>33?"water3":e>0?"water":void 0;a=t?vt(t,!0,"--ent-spd:1","tile-icon"):q``}else if(l){const e="heating"===l.hvacAction,t=l.valvePosition,i=e?null!=t?t>66?"flame3":t>33?"flame2":"flame":"flame":void 0;a=i?vt(i,!0,"--ent-spd:1","tile-icon"):q``}else a=q``;const p=r?e.renderEntityAnim(r.entityId,f,i.device_id):q``,u=r&&e.showEl("toggle")?q`
        <button class="tog ${f?"on":"off"}"
          @click=${t=>e.toggle(r.entityId,f,t)}>
          ${it(f?"state.on_short":"state.off_short")}
        </button>
      `:l?q`
        <button class="tog ${_?"on":"off"}"
          @click=${t=>e.setHvacMode(l.entityId,_?"off":"heat",t)}>
          ${it(_?"action.heat":"action.off")}
        </button>
      `:Y;return q`
        <div class="tile-top">
          <div class="tile-left tile-trigger">
            <span class="dot ${n?"online":"offline"}"></span>
            ${a}
            ${p}
            ${c?Y:u}
            <span class="tile-name">${i.name}</span>
            ${h?q`<span class="update-dot" title="Firmware update">●</span>`:Y}
          </div>
          ${c?q`
            <div class="cov-btns" @click=${e=>e.stopPropagation()}>
              <button class="cov-btn" @click=${t=>e.coverAction(c.entityId,"open",t)}>▲</button>
              <button class="cov-btn stop" @click=${t=>e.coverAction(c.entityId,"stop",t)}>■</button>
              <button class="cov-btn" @click=${t=>e.coverAction(c.entityId,"close",t)}>▼</button>
            </div>
          `:Y}
        </div>
      `}case"sensors":{if(!g.length)return q``;const e=g.filter(e=>"primary"===(e.tier??"primary")),t=g.filter(e=>"electrical"===e.tier),i=g.filter(e=>"diag"===e.tier),s=new Set(["humidity","battery","gas","co2","door","motion","flood","smoke","vibration","overtemp","overpower"]),o=new Map;for(const e of t){const t=e.ch??"";o.has(t)||o.set(t,[]),o.get(t).push(e)}const a=e=>"cloud"===e.key||"mqtt"===e.key||"eth"===e.key?`${e.label} ${e.value===it("state.connected")?"✓":"✗"}`:`${e.label} ${e.value}`;return q`
        ${e.length?q`
          <div class="tile-stats">
            ${e.map(e=>q`
              <span class="stat-item ${e.warn?"warn":""}">
                ${e.ch?q`<span class="stat-lbl">${e.ch}</span>`:Y}
                ${!e.ch&&e.key&&s.has(e.key)?q`<span class="stat-lbl">${e.label}</span>`:Y}
                ${e.value}
              </span>`)}
          </div>`:Y}
        ${t.length?q`
          <div class="tile-elec-wrap">
            ${[...o.entries()].map(([e,t])=>q`
              <div class="tile-elec">
                ${e?q`<span class="stat-lbl">${e}</span>`:Y}
                ${t.map((e,t)=>q`${t>0?q`<span class="sep">·</span>`:Y}${"power_factor"===e.key?`PF ${e.value}`:e.value}`)}
              </div>`)}
          </div>`:Y}
        ${i.length?q`
          <div class="tile-diag" title=${i.map(e=>`${e.label}: ${e.value}`).join("  ·  ")}>
            ${i.map((e,t)=>q`${t>0?q`<span class="sep">·</span>`:Y}<span class="${e.warn?"warn":""}">${a(e)}</span>`)}
          </div>`:Y}
      `}case"graph":return e.renderSparklines(i);case"dimmer":{const t=r?a.states[r.entityId]:null,i=t?.attributes?.effect_list??[],s=t?.attributes?.effect??null,o=r?.whiteValue??0;return r&&m?q`
        <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
          ${y?q`
            <input type="color" class="color-swatch tile-color-swatch" .value=${x}
              ?disabled=${!f}
              @change=${t=>{t.stopPropagation(),e.setColor(r.entityId,t.target.value,o,w)}}/>
          `:Y}
          <input type="range" class="dim-slider" min="1" max="100"
            style=${ke(y?{accentColor:x}:{})}
            .value=${String(f?Math.max(1,r.brightness??1):1)}
            ?disabled=${!f}
            @input=${e=>{const t=e.target.closest(".tile-dim-row")?.querySelector(".dim-pct");t&&(t.textContent=`${e.target.value}%`)}}
            @change=${t=>{e.setBrightness(r.entityId,parseInt(t.target.value,10))}}/>
          <span class="dim-pct">${b}%</span>
        </div>
        ${w?q`
          <div class="tile-dim-row tile-white-row" @click=${e=>e.stopPropagation()}>
            <span class="dim-white-lbl">W</span>
            <input type="range" class="dim-slider white-slider" min="0" max="255"
              .value=${String(o)}
              @input=${e=>{const t=e.target.closest(".tile-white-row")?.querySelector(".white-pct");t&&(t.textContent=e.target.value)}}
              @change=${t=>{const i=parseInt(t.target.value,10);e.setColor(r.entityId,x,i,!0)}}/>
            <span class="white-pct dim-pct">${o}</span>
          </div>
        `:Y}
        ${ht(i,s,e=>a.callService("light","turn_on",{entity_id:r.entityId,effect:e}))}
      `:q``}case"cover_controls":return c?q`
        <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
          <div class="cov-bar">
            <div class="cov-fill" style="width:${c.position??("open"===c.state?100:0)}%"></div>
          </div>
          <span class="cov-pct">${null!=c.position?`${Math.round(c.position)}%`:c.state}</span>
        </div>
      `:q``;case"trv_control":{const t=i.entities.find(e=>"sensor"===e.domain&&"battery"===a.states[e.entity_id]?.attributes?.device_class),s=null!=t&&parseFloat(a.states[t.entity_id]?.state??"")||null,o={comfort:"🏠",eco:"🌿",boost:"🚀",away:"🌙",none:"❄️"};return l?q`
        <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
          ${e.renderTrvDial(l)}
          <div class="trv-dial-btns">
            <button class="trv-step" @click=${()=>e.adjustTrvTemp(l,-1)}>−</button>
            <span class="trv-flame">${"heating"===l.hvacAction?"🔥":""}</span>
            <button class="trv-step" @click=${()=>e.adjustTrvTemp(l,1)}>+</button>
          </div>
          <div class="trv-stat-row">
            <div class="trv-stat"><span class="trv-stat-lbl">${it("tile.now")}</span><span class="trv-stat-val">${null!=l.currentTemp?`${l.currentTemp}°`:"—"}</span></div>
            <div class="trv-stat"><span class="trv-stat-lbl">${it("tile.set")}</span><span class="trv-stat-val">${null!=l.targetTemp?`${l.targetTemp.toFixed(1)}°`:"—"}</span></div>
            ${null!=l.valvePosition?q`<div class="trv-stat"><span class="trv-stat-lbl">${it("tile.valve")}</span><span class="trv-stat-val">${Math.round(l.valvePosition)}%</span></div>`:Y}
            ${null!=s?q`<div class="trv-stat"><span class="trv-stat-lbl">${it("chip.battery_short")}</span><span class="trv-stat-val">${s}%</span></div>`:Y}
          </div>
          ${l.presetModes.length?q`
            <div class="trv-presets">
              ${l.presetModes.map(t=>q`
                <button class="trv-preset-btn ${l.presetMode===t?"active":""}"
                  @click=${()=>e.setPresetMode(l.entityId,t)}>
                  ${(o[t]??"")+t}
                </button>
              `)}
            </div>
          `:Y}
        </div>
      `:q``}case"input_channels":return v.length?q`
        <div class="tile-inputs" @click=${e=>e.stopPropagation()}>
          ${v.map(t=>rt(e,i,t))}
        </div>
      `:q``;case"virtual_controls":{const t=e.getVirtualControls(i);return t.length?q`
        <div class="tile-virtuals" @click=${e=>e.stopPropagation()}>
          ${t.map(t=>{if("unavailable"===t.value)return Y;if("select"===t.domain){const i=t.options??[],s=i.indexOf(t.value);return q`
                <div class="virt-row">
                  <span class="virt-lbl">${t.label}</span>
                  <div class="virt-select">
                    <button class="virt-arr" @click=${()=>{const o=i[(s-1+i.length)%i.length];e.selectOption(t.entityId,o)}}>‹</button>
                    <span class="virt-val">${t.value.replace(/_/g," ")}</span>
                    <button class="virt-arr" @click=${()=>{const o=i[(s+1)%i.length];e.selectOption(t.entityId,o)}}>›</button>
                  </div>
                </div>`}if("number"===t.domain){const i=parseFloat(t.value),s=t.step??1,o=s<1?String(s).split(".")[1]?.length??1:0;return q`
                <div class="virt-row">
                  <span class="virt-lbl">${t.label}</span>
                  <div class="virt-num">
                    <button class="virt-arr" @click=${()=>e.setNumberValue(t.entityId,Math.max(t.min??0,+(i-s).toFixed(o)))}>−</button>
                    <span class="virt-val">${isNaN(i)?t.value:i.toFixed(o)}</span>
                    <button class="virt-arr" @click=${()=>e.setNumberValue(t.entityId,Math.min(t.max??100,+(i+s).toFixed(o)))}>+</button>
                  </div>
                </div>`}return"button"===t.domain?q`
                <div class="virt-row">
                  <button class="virt-btn" @click=${i=>e.pressButton(t.entityId,i)}>${t.label}</button>
                </div>`:"text"===t.domain?q`
                <div class="virt-row">
                  <span class="virt-lbl">${t.label}</span>
                  <span class="virt-val">${t.value}</span>
                </div>`:"switch"===t.domain?q`
                <div class="virt-row">
                  <span class="virt-lbl">${t.label}</span>
                  <button class="tog sm ${t.isOn?"on":"off"}"
                    @click=${i=>e.toggle(t.entityId,t.isOn,i)}>
                    ${t.isOn?it("state.on_short"):it("state.off_short")}
                  </button>
                </div>`:Y})}
        </div>`:q``}case"relay_channels":{const t=i.entities.filter(e=>"switch"===e.domain&&/_(switch|relay|channel)_\d/.test(e.entity_id));return t.length<=1?q``:q`
        <div class="relay-channels" @click=${e=>e.stopPropagation()}>
          ${t.map(t=>{const s=a.states[t.entity_id],o="on"===s?.state,n=s?.attributes?.friendly_name??t.entity_id;return q`
              <div class="relay-ch-row">
                <span class="relay-ch-dot ${o?"on":""}"></span>
                ${e.renderEntityAnim(t.entity_id,o,i.device_id)}
                <span class="relay-ch-name">${n}</span>
                <button class="tog sm ${o?"on":"off"}"
                  @click=${i=>e.toggle(t.entity_id,o,i)}>
                  ${it(o?"state.on_short":"state.off_short")}
                </button>
              </div>`})}
        </div>`}case"valve_controls":{const t=e.getValve(i);return t?q`
        <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
          ${e.renderValveDial(t)}
          <div class="valve-dial-btns">
            <button class="valve-btn close" @click=${i=>e.valveAction(t.entityId,"close",i)}>${it("action.close")}</button>
            <button class="valve-btn stop" @click=${i=>e.valveAction(t.entityId,"stop",i)}>■</button>
            <button class="valve-btn open" @click=${i=>e.valveAction(t.entityId,"open",i)}>${it("action.open")}</button>
          </div>
        </div>
      `:q``}case"media_controls":{const t=i.entities.find(e=>"media_player"===e.domain&&!e.entity_category),s=t?a.states[t.entity_id]:void 0;if(!t||!s)return q``;const n=s.attributes,r=Number(n.supported_features??0),l={PAUSE:1,VOLUME_SET:4,VOLUME_MUTE:8,PREV:16,NEXT:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,STOP:4096,PLAY:16384,BROWSE:131072},c=e=>0!==(r&e),d=s.state,p="playing"===d,h="off"===d||"standby"===d||"unavailable"===d,u=[n.media_title,n.media_artist].filter(Boolean).join(" · ")||n.source||"",g="number"==typeof n.volume_level?Math.round(100*n.volume_level):null,v=!0===n.is_volume_muted,f=(e,i={})=>a.callService("media_player",e,{entity_id:t.entity_id,...i}),m=p?it("media.playing"):"paused"===d?it("media.paused"):"idle"===d?it("media.idle"):"unavailable"===d?it("media.unavailable"):h?it("media.off"):d,b=function(e,t){const i=e.device_styles?.[t.device_id]?.radio_stations??e.radio_stations;return(Array.isArray(i)?i:[]).filter(e=>e&&"string"==typeof e.url&&!!e.url)}(o,i),y=c(l.BROWSE)?e.getBrowseGroups(t.entity_id):null,x=Array.isArray(y)?y:[],w=new Map;for(const e of x)for(const t of e.items)w.set(t.id,t.type);for(const e of b)w.has(e.url)||w.set(e.url,"music");const _=n.media_content_id,k=n.media_title,A=()=>{for(const e of x)for(const t of e.items)if(t.title===k)return t.id;return b.find(e=>e.name===k)?.url},S=(_&&w.has(_)?_:void 0)??(k?A():void 0)??"",C=c(l.PLAY_MEDIA)&&(c(l.BROWSE)||b.length>0),$=Array.isArray(y)&&!x.some(e=>e.items.length)&&!b.length,E=i=>{i.stopPropagation(),c(l.BROWSE)&&e.requestBrowse(t.entity_id)};return q`
        <div class="tile-media" @click=${e=>e.stopPropagation()}>
          <div class="tile-media-now">
            <span class="tile-media-state ${p?"on":""}">${m}</span>
            <span class="tile-media-title" title=${u}>${u||"—"}</span>
            ${C?q`
              <select class="input-sel tile-media-sel" title="Play a station"
                @pointerdown=${E} @focus=${E}
                @change=${e=>{const t=e.target.value;t&&f("play_media",{media_content_id:t,media_content_type:w.get(t)??"music"})}}>
                <option value="" ?selected=${!S}>${it("media.station")}</option>
                ${"pending"===y?q`<option value="" disabled>${it("media.loading")}</option>`:Y}
                ${$?q`<option value="" disabled>${it("media.no_favourites")}</option>`:Y}
                ${x.filter(e=>e.items.length).map(e=>q`
                  <optgroup label=${e.label}>
                    ${e.items.map(e=>q`<option value=${e.id} ?selected=${e.id===S}>${e.title}</option>`)}
                  </optgroup>`)}
                ${b.length?q`
                  <optgroup label="Streams">
                    ${b.map(e=>q`<option value=${e.url} ?selected=${e.url===S}>${e.name}</option>`)}
                  </optgroup>`:Y}
              </select>`:Y}
            ${c(l.BROWSE)?q`
              <button class="tile-media-btn" title="Browse media in Home Assistant" @click=${()=>e.fireMoreInfo(t.entity_id)}>☰</button>`:Y}
          </div>
          <div class="tile-media-row">
            ${c(l.TURN_ON)||c(l.TURN_OFF)?q`
              <button class="tile-media-btn ${h?"":"on"}" title=${it(h?"action.turn_on":"action.turn_off")}
                @click=${()=>f(h?"turn_on":"turn_off")}>⏻</button>`:Y}
            ${c(l.PREV)?q`<button class="tile-media-btn" title=${it("action.previous")} @click=${()=>f("media_previous_track")}>⏮</button>`:Y}
            ${c(l.PLAY)||c(l.PAUSE)?q`
              <button class="tile-media-btn tile-media-play ${p?"on":""}" title=${it(p?"action.pause":"action.play")}
                @click=${()=>f(p?c(l.PAUSE)?"media_pause":"media_stop":"media_play")}>${p?"⏸":"▶"}</button>`:Y}
            ${c(l.STOP)?q`<button class="tile-media-btn" title=${it("action.stop")} @click=${()=>f("media_stop")}>⏹</button>`:Y}
            ${c(l.NEXT)?q`<button class="tile-media-btn" title=${it("action.next")} @click=${()=>f("media_next_track")}>⏭</button>`:Y}
            ${null!=g&&c(l.VOLUME_SET)?q`
              ${c(l.VOLUME_MUTE)?q`
                <button class="tile-media-btn" title=${it(v?"action.unmute":"action.mute")}
                  @click=${()=>f("volume_mute",{is_volume_muted:!v})}>${v?"🔇":"🔊"}</button>`:Y}
              <input type="range" class="tile-media-vol" min="0" max="100" .value=${String(g)} title=${it("media.volume",{n:g})}
                @pointerdown=${e=>e.stopPropagation()}
                @change=${e=>f("volume_set",{volume_level:parseInt(e.target.value,10)/100})}/>
              <span class="tile-media-pct">${g}%</span>`:Y}
          </div>
        </div>`}case"delegated_controls":{if(!o.delegate_controls)return q``;const e=Tt(i);return e.length?q`
        <div class="tile-delegated" @click=${e=>e.stopPropagation()}>
          ${e.map(e=>q`
            <hdd-delegated .hass=${a} .entity=${e.entity_id} .features=${Et[e.domain]}></hdd-delegated>
          `)}
        </div>`:q``}case"power_bar":return e.renderPowerBar(i);case"badges":return q`
        <div class="tile-bot">
          ${null!=u?q`<span class="tile-power">${ni(u)}</span>`:Y}
          <div class="tile-badges">
            ${p.map(e=>q`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
            ${s.label?q`<span class="type-badge type-${s.type}">${st(`profile.${s.type}`,s.label)}</span>`:Y}
            ${k?q`<span class="gen-badge gen-${s.gen}">${k}</span>`:Y}
            ${A?q`<span class="int-badge-tile">${A}</span>`:Y}
            ${i.isShelly&&i.ip&&(S=i.ip,/^10\./.test(S)||/^192\.168\./.test(S)||/^172\.(1[6-9]|2\d|3[01])\./.test(S)||/^169\.254\./.test(S))?q`
              <a href="http://${i.ip}" target="_blank" class="tile-ui-link"
                @click=${e=>e.stopPropagation()}>↗</a>
            `:Y}
          </div>
        </div>
      `;default:return q``}var S}const Os=255;function zs(e){return q`
    <div class="ds-backdrop" @click=${()=>e.closeDetailSheet()}>
      <div class="ds-sheet" @click=${e=>e.stopPropagation()}>
        ${function(e){const{device:t,profile:i,accent:s,online:o}=e,a=e.getFirmware(t),n=e.tileSensors(t);return q`
    <div class="ds-header" style="--ds-accent:${s}">
      <div class="ds-header-top">
        <div class="ds-header-info">
          <span class="dot ${o?"online":"offline"}"></span>
          <span class="ds-device-name">${t.name}</span>
        </div>
        <button class="ds-close" @click=${()=>e.closeDetailSheet()}>✕</button>
      </div>
      <div class="ds-header-meta">
        ${t.area?q`<span class="ds-chip ds-chip--room">${t.area}</span>`:Y}
        <span class="ds-chip ds-chip--type">${i.label}</span>
        ${t.model?q`<span class="ds-chip">${t.model}</span>`:Y}
        ${"ble"===i.gen?q`<span class="ds-chip">BLE</span>`:"other"!==i.gen?q`<span class="ds-chip">Gen ${i.gen}</span>`:Y}
        ${t.ip?q`<span class="ds-chip">${t.ip}</span>`:Y}
      </div>
      ${a?q`<div class="ds-fw-update">
        <span>${it("detail.fw_update",{from:a.current??"",to:a.newVersion??""})}</span>
        <button class="ds-fw-install" title=${it("detail.install_now",{version:a.newVersion??""})}
          @click=${t=>e.installUpdate(a.entityId,t)}>${it("action.install")}</button>
      </div>`:Y}
      ${null!=n.rssi?q`<div class="ds-signal">${it("detail.signal",{quality:hi(n.rssi),dbm:n.rssi})}${null!=n.uptime?q` · ${it("detail.uptime_inline",{value:pi(n.uptime)})}`:Y}</div>`:Y}
      <div class="ds-accent-bar" style="background:${s}"></div>
    </div>`}(e)}
        <div class="ds-body ds-body--${e.profile.type}">
          ${function(e){switch(e.profile.type){case"relay":return function(e){const{device:t,hass:i}=e,s=t.entities.filter(e=>"switch"===e.domain&&/_(switch|relay|channel)_\d/.test(e.entity_id));return q`
    ${s.length>1?q`
      <div class="ds-section">
        <div class="ds-section-title">${it("detail.relay_channels")}</div>
        <div class="ds-channel-list">
          ${s.map(s=>{const o=i.states[s.entity_id],a="on"===o?.state,n=o?.attributes?.friendly_name??s.entity_id,r=s.entity_id.match(/_(?:switch|relay|channel)_\d+/)?.[0]??"",l=r?t.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes(r)&&"power"===i.states[e.entity_id]?.attributes?.device_class):void 0,c=l?parseFloat(i.states[l.entity_id]?.state??""):NaN;return q`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${n}</span>
                ${isNaN(c)?Y:q`<span class="ds-channel-power">${ni(c)}</span>`}
                <button class="tog ${a?"on":"off"}" @click=${t=>e.toggle(s.entity_id,a,t)}>${it(a?"state.on_short":"state.off_short")}</button>
              </div>`})}
        </div>
      </div>`:1===s.length?q`
      <div class="ds-section ds-single-toggle">
        ${(()=>{const t=i.states[s[0].entity_id],o="on"===t?.state;return q`
          <button class="tog ds-big-toggle ${o?"on":"off"}" @click=${t=>e.toggle(s[0].entity_id,o,t)}>${it(o?"state.on_short":"state.off_short")}</button>`})()}
      </div>`:Y}
    ${Rs(e)}`}(e);case"plug":return function(e){const t=e.getPrimarySwitch(e.device),i=t?.isOn??!1,s=e.tileSensors(e.device);return q`
    <div class="ds-section ds-plug-hero">
      ${t?q`<button class="tog ds-big-toggle ${i?"on":"off"}" @click=${s=>e.toggle(t.entityId,i,s)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
      ${null!=s.power?q`<span class="ds-big-power">${ni(s.power)}</span>`:Y}
    </div>
    ${Rs(e)}`}(e);case"dimmer":return function(e){const t=e.getPrimarySwitch(e.device),i=t?.isOn??!1,s=t?.brightness??0,o=Math.round(s/255*100);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.brightness")}</div>
      <div class="ds-dimmer-control">
        <span class="ds-dimmer-pct">${o}%</span>
        <input type="range" min="0" max="255" .value=${String(s)}
          @change=${i=>e.setBrightness(t.entityId,parseInt(i.target.value))}
          class="ds-slider">
        ${t?q`<button class="tog ${i?"on":"off"}" @click=${s=>e.toggle(t.entityId,i,s)}>${it(i?"state.on_short":"state.off_short")}</button>`:Y}
      </div>
    </div>
    ${Rs(e)}`}(e);case"rgb":return function(e){const{accent:t}=e,i=e.getPrimarySwitch(e.device),s=i?.isOn??!1,o=i?.brightness??0,a=Math.round(o/Os*100);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.light_controls")}</div>
      <div class="ds-dimmer-control">
        <span class="ds-dimmer-pct">${a}%</span>
        <input type="range" min="0" max="255" .value=${String(o)}
          @change=${t=>e.setBrightness(i.entityId,parseInt(t.target.value))}
          class="ds-slider" style="--ds-accent:${t}">
        ${i?q`<button class="tog ${s?"on":"off"}" @click=${t=>e.toggle(i.entityId,s,t)}>${it(s?"state.on_short":"state.off_short")}</button>`:Y}
      </div>
      ${i?.rgbColor?q`<div class="ds-color-swatch" style="background:rgb(${i.rgbColor.join(",")})"></div>`:Y}
    </div>
    ${Rs(e)}`}(e);case"climate":return function(e){const t=e.getTrv(e.device);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.climate")}</div>
      ${t?q`
        <div class="ds-climate-info">
          <div class="ds-climate-current">
            <span class="ds-climate-label">${it("detail.climate_current")}</span>
            <span class="ds-climate-val">${t.currentTemp?.toFixed(1)??"—"}°C</span>
          </div>
          <div class="ds-climate-target">
            <button class="ds-temp-btn" @click=${()=>e.setTemp(t.entityId,Math.max(t.minTemp,(t.targetTemp??20)-t.step))}>−</button>
            <span class="ds-climate-val ds-climate-target-val">${t.targetTemp?.toFixed(1)??"—"}°C</span>
            <button class="ds-temp-btn" @click=${()=>e.setTemp(t.entityId,Math.min(t.maxTemp,(t.targetTemp??20)+t.step))}>+</button>
          </div>
        </div>
        <div class="ds-climate-modes">
          <span class="ds-chip">${t.hvacMode}</span>
          ${t.hvacAction?q`<span class="ds-chip">${t.hvacAction}</span>`:Y}
          ${t.presetMode?q`<span class="ds-chip">${t.presetMode}</span>`:Y}
        </div>
        ${null!=t.valvePosition?q`<div class="ds-valve-pos">${it("detail.valve_pos",{n:t.valvePosition})}</div>`:Y}
      `:q`<span class="ds-muted">${it("empty.no_climate")}</span>`}
    </div>
    ${Rs(e)}`}(e);case"cover":return function(e){const t=e.getCover(e.device);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.cover")}</div>
      ${t?q`
        <div class="ds-cover-controls">
          <button class="ds-cover-btn" @click=${i=>e.coverAction(t.entityId,"open",i)}>▲ Open</button>
          <button class="ds-cover-btn" @click=${i=>e.coverAction(t.entityId,"stop",i)}>■ Stop</button>
          <button class="ds-cover-btn" @click=${i=>e.coverAction(t.entityId,"close",i)}>▼ Close</button>
        </div>
        ${null!=t.position?q`<div class="ds-cover-pos">Position: ${t.position}%</div>`:Y}
        <span class="ds-chip">${t.state}</span>
      `:q`<span class="ds-muted">${it("empty.no_cover")}</span>`}
    </div>
    ${Rs(e,{history:!1})}`}(e);case"valve":return function(e){const t=e.getValve(e.device);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.valve")}</div>
      ${t?q`
        <div class="ds-cover-controls">
          <button class="ds-cover-btn" @click=${i=>e.valveAction(t.entityId,"open",i)}>▲ Open</button>
          <button class="ds-cover-btn" @click=${i=>e.valveAction(t.entityId,"stop",i)}>■ Stop</button>
          <button class="ds-cover-btn" @click=${i=>e.valveAction(t.entityId,"close",i)}>▼ Close</button>
        </div>
        ${null!=t.position?q`<div class="ds-cover-pos">Position: ${t.position}%</div>`:Y}
        ${null!=t.temperature?q`<div class="ds-cover-pos">Temp: ${t.temperature.toFixed(1)}°C</div>`:Y}
        <span class="ds-chip">${t.state}</span>
      `:q`<span class="ds-muted">${it("empty.no_valve")}</span>`}
    </div>
    ${Rs(e,{sensors:!1,history:!1})}`}(e);case"energy":return function(e){return q`${Rs(e)}`}(e);case"sensor":return function(e){const{device:t,hass:i}=e,s=t.entities.find(e=>{if("sensor"!==e.domain)return!1;const t=i.states[e.entity_id];return t&&!isNaN(parseFloat(t.state))}),o=e.getAlerts(t);return q`
    ${s?(()=>{const e=i.states[s.entity_id],t=parseFloat(e?.state??""),o=e?.attributes?.unit_of_measurement??"";return q`
        <div class="ds-section ds-sensor-hero">
          <span class="ds-big-value">${isNaN(t)?"—":t.toFixed(1)}</span>
          <span class="ds-big-unit">${o}</span>
        </div>`})():Y}
    ${o.length?q`<div class="ds-section ds-alert-row">${o.map(e=>q`<span class="ds-chip ds-chip--alert">${e}</span>`)}</div>`:Y}
    ${Rs(e,{historyFirst:!0})}`}(e);case"input":return function(e){const{device:t}=e,i=e.getInputChannels(t);return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.input_channels")}</div>
      ${i.length?q`
        <div class="ds-channel-list">
          ${i.map(i=>{const s=e.getInputActionLabel(t,i),o=e.getInputActionState(t,i),a=i.lastChanged?e.timeAgo(i.lastChanged):"";return q`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${i.label}</span>
                ${s?q`<span class="ds-chip ${"on"===o?"ds-chip--on":""}">${s}</span>`:q`<span class="ds-chip ${i.isOn?"ds-chip--on":""}">
                      ${"button"===i.kind?i.lastEvent?i.lastEvent.replace(/_/g," "):"—":i.isOn?it("state.on_short"):it("state.off_short")}
                    </span>`}
                ${a?q`<span class="ds-ent-age">${a}</span>`:Y}
              </div>`})}
        </div>`:q`<span class="ds-muted">${it("empty.no_inputs")}</span>`}
    </div>
    ${Rs(e,{sensors:!1,history:!1})}`}(e);case"uni":return function(e){const{device:t,hass:i}=e,s=t.entities.filter(e=>"sensor"===e.domain&&(e.entity_id.includes("adc")||e.entity_id.includes("analog"))),o=t.entities.filter(e=>"switch"===e.domain);return q`
    ${s.length?q`
      <div class="ds-section">
        <div class="ds-section-title">${it("detail.adc_inputs")}</div>
        ${s.map(e=>{const t=i.states[e.entity_id],s=t?.state??"—",o=t?.attributes?.unit_of_measurement??"",a=t?.attributes?.friendly_name??e.entity_id;return q`<div class="ds-channel-row"><span class="ds-channel-name">${a}</span><span>${s} ${o}</span></div>`})}
      </div>`:Y}
    ${o.length?q`
      <div class="ds-section">
        <div class="ds-section-title">${it("detail.outputs")}</div>
        <div class="ds-channel-list">
          ${o.map(t=>{const s=i.states[t.entity_id],o="on"===s?.state,a=s?.attributes?.friendly_name??t.entity_id;return q`
              <div class="ds-channel-row">
                <span class="ds-channel-name">${a}</span>
                <button class="tog ${o?"on":"off"}" @click=${i=>e.toggle(t.entity_id,o,i)}>${it(o?"state.on_short":"state.off_short")}</button>
              </div>`})}
        </div>
      </div>`:Y}
    ${Rs(e,{sensors:!1,history:!1})}`}(e);case"wall_display":return function(e){const t=e.getTrv(e.device),i=e.getPrimarySwitch(e.device),s=i?.isOn??!1;return q`
    ${t?q`
      <div class="ds-section">
        <div class="ds-section-title">${it("detail.climate")}</div>
        <div class="ds-climate-info">
          <div class="ds-climate-current">
            <span class="ds-climate-label">${it("detail.climate_current")}</span>
            <span class="ds-climate-val">${t.currentTemp?.toFixed(1)??"—"}°C</span>
          </div>
          <div class="ds-climate-target">
            <button class="ds-temp-btn" @click=${()=>e.setTemp(t.entityId,Math.max(t.minTemp,(t.targetTemp??20)-t.step))}>−</button>
            <span class="ds-climate-val ds-climate-target-val">${t.targetTemp?.toFixed(1)??"—"}°C</span>
            <button class="ds-temp-btn" @click=${()=>e.setTemp(t.entityId,Math.min(t.maxTemp,(t.targetTemp??20)+t.step))}>+</button>
          </div>
        </div>
      </div>`:Y}
    ${i?q`
      <div class="ds-section ds-single-toggle">
        <button class="tog ds-big-toggle ${s?"on":"off"}" @click=${t=>e.toggle(i.entityId,s,t)}>${it(s?"state.on_short":"state.off_short")}</button>
      </div>`:Y}
    ${Rs(e)}`}(e);default:return function(e){const{device:t,hass:i}=e,s=t.entities.filter(e=>["select","number","button","text","input_boolean","input_number","input_select"].includes(e.domain));return q`
    ${s.length?q`
      <div class="ds-section">
        <div class="ds-section-title">${it("detail.controls")}</div>
        ${s.map(e=>{const t=i.states[e.entity_id],s=t?.attributes?.friendly_name??e.entity_id;return q`<div class="ds-channel-row"><span class="ds-channel-name">${s}</span><span>${t?.state??"unknown"}</span></div>`})}
      </div>`:Y}
    ${Rs(e,{sensors:!1})}`}(e)}}(e)}
        </div>
      </div>
    </div>`}function Ps(e){if(!e.getGraphEntities(e.device).length)return q``;const t=e.getDetailHistoryRange();return q`
    <div class="ds-section">
      <div class="ds-tabs">
        <button class="ds-tab ${24===t?"ds-tab--active":""}" @click=${()=>e.setDetailHistoryRange(24)}>24h</button>
        <button class="ds-tab ${168===t?"ds-tab--active":""}" @click=${()=>e.setDetailHistoryRange(168)}>7d</button>
        <button class="ds-tab ${720===t?"ds-tab--active":""}" @click=${()=>e.setDetailHistoryRange(720)}>30d</button>
      </div>
      ${e.renderSparklinesExpanded(e.device,t)}
    </div>`}function Rs(e,t={}){const{sensors:i=!0,history:s=!0,historyFirst:o=!1}=t;return q`
    ${o&&s?Ps(e):Y}
    ${i?function(e){const t=e.tileSensors(e.device);return null!=t.power||null!=t.voltage||null!=t.current||null!=t.energy||null!=t.temp?q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.sensors")}</div>
      <div class="ds-sensor-grid">
        ${null!=t.power?q`<div class="ds-sensor-item"><span class="ds-sensor-val">${ni(t.power)}</span><span class="ds-sensor-label">${it("detail.sensor_power")}</span></div>`:Y}
        ${null!=t.voltage?q`<div class="ds-sensor-item"><span class="ds-sensor-val">${li(t.voltage)}</span><span class="ds-sensor-label">${it("detail.sensor_voltage")}</span></div>`:Y}
        ${null!=t.current?q`<div class="ds-sensor-item"><span class="ds-sensor-val">${ci(t.current)}</span><span class="ds-sensor-label">${it("detail.sensor_current")}</span></div>`:Y}
        ${null!=t.energy?q`<div class="ds-sensor-item"><span class="ds-sensor-val">${ri(t.energy)}</span><span class="ds-sensor-label">${t.energyLabel}</span></div>`:Y}
        ${null!=t.temp?q`<div class="ds-sensor-item"><span class="ds-sensor-val">${di(t.temp)}</span><span class="ds-sensor-label">${it("detail.sensor_temp")}</span></div>`:Y}
      </div>
    </div>`:q``}(e):Y}
    ${!o&&s?Ps(e):Y}
    ${function(e){const{device:t,hass:i}=e;if(!t.entities.length)return q``;if(!1===e.config.show_entity_list)return q``;const s=new Set(e.config.hidden_entities??[]),o=t.entities.filter(e=>!s.has(e.entity_id));if(!o.length)return q``;const a=(t,s)=>{const o=i.states[t.entity_id],a=o?.attributes?.friendly_name??t.entity_id,n=o?.state??"unknown",r=o?.attributes?.unit_of_measurement??"",l="switch"===t.domain||"light"===t.domain||"input_boolean"===t.domain,c="on"===n,d=o?.last_changed?e.timeAgo(o.last_changed):"";return q`
      <div class="ds-entity-row ${s?"is-secondary":""}" @click=${()=>e.fireMoreInfo(t.entity_id)}>
        <span class="ds-ent-icon">${(e=>"switch"===e?"⏻":"light"===e?"💡":"sensor"===e?"📊":"binary_sensor"===e?"◉":"climate"===e?"🌡":"cover"===e?"🪟":"update"===e?"⬆":"button"===e?"⏺":"number"===e?"#":"select"===e?"☰":"text"===e?"Aa":"•")(t.domain)}</span>
        <span class="ds-ent-name">${a}</span>
        <span class="ds-ent-state">${n}${r?` ${r}`:""}</span>
        ${t.borrowed_from?q`<span class="ds-ent-age" title="Shown here via extra_sensors">from ${t.borrowed_from}</span>`:Y}
        ${d?q`<span class="ds-ent-age">${d}</span>`:Y}
        ${l?q`<button class="tog ${c?"on":"off"}" @click=${i=>{i.stopPropagation(),e.toggle(t.entity_id,c,i)}}>${it(c?"state.on_short":"state.off_short")}</button>`:Y}
      </div>`},n=o.filter(e=>"primary"===kt(e)),r=o.filter(e=>"config"===kt(e)),l=o.filter(e=>"diagnostic"===kt(e));return q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.all_entities")}</div>
      ${n.map(e=>a(e,!1))}
      ${r.length?q`<div class="ds-ent-subgroup">${it("detail.configuration")}</div>${r.map(e=>a(e,!0))}`:Y}
      ${l.length?q`<div class="ds-ent-subgroup">${it("detail.diagnostic")}</div>${l.map(e=>a(e,!0))}`:Y}
    </div>`}(e)}
    ${function(e){const{device:t}=e,i=e.getAlerts(t),s=e.getFirmware(t),o=e.tileSensors(t);return i.length||s||null!=o.rssi||null!=o.uptime||t.ip?q`
    <div class="ds-section">
      <div class="ds-section-title">${it("detail.diagnostics")}</div>
      <div class="ds-diag-grid">
        ${t.ip?q`<div class="ds-diag-item"><span class="ds-diag-label">IP</span><span class="ds-diag-val">${t.ip}</span></div>`:Y}
        ${null!=o.rssi?q`<div class="ds-diag-item"><span class="ds-diag-label">${it("detail.rssi")}</span><span class="ds-diag-val">${hi(o.rssi)} (${o.rssi} dBm)</span></div>`:Y}
        ${null!=o.uptime?q`<div class="ds-diag-item"><span class="ds-diag-label">${it("detail.uptime")}</span><span class="ds-diag-val">${pi(o.uptime)}</span></div>`:Y}
        ${s?q`<div class="ds-diag-item"><span class="ds-diag-label">${it("detail.firmware")}</span><span class="ds-diag-val">${s.current} → ${s.newVersion}</span></div>`:Y}
        ${i.length?q`<div class="ds-diag-item ds-diag-alert"><span class="ds-diag-label">${it("detail.alerts")}</span><span class="ds-diag-val">${i.join(", ")}</span></div>`:Y}
      </div>
    </div>`:q``}(e)}`}var Bs;const Ls=e=>null==e?[]:Array.isArray(e)?e.filter(Boolean):[e];let Fs=!1;let Ns=Bs=class extends de{constructor(){super(...arguments),this.preview=!1,this._closedAreas=new Set,this._areaChipOpen=null,this._graphData=new Map,this._periodEnergy=new Map,this._periodEnergyFetching=new Set,this._periodEnergyAt=new Map,this._periodEnergyQueue=[],this._periodEnergyInFlight=0,this._maxPeriodEnergyFetch=4,this._periodEnergyPending=new Map,this._periodEnergyCommitTimer=null,this._periodEnergyErrAt=new Map,this._valveDragPos=null,this._trvDragTemp=null,this._trvBtnTimer=null,this._cloudDetailOpen=null,this._detailDevice=null,this._confirmOff=null,this._detailHistoryRange=24,this._activeViewId=null,this._delegateNoticeDismissed=!1,this._discoveryNoticeDismissed=!1,this._discoveryStats={notShelly:0,byIntegration:0,byDomain:0,byScope:0,integrations:[]},this._attentionOpen=!1,this._editPreviewChecked=!1,this._lpStart=null,this._graphFetching=new Set,this._graphFetchedAt=new Map,this._cachedDevices=null,this._cacheEntitiesRef=null,this._cacheDevicesRef=null,this._cacheConfigRef=null,this._cacheBorrowedReady=-1,this._profileCache=new Map,this._cachedCardStyles=null,this._cardStylesConfigRef=null,this._cardStylesViewRef=null,this._cachedStyleTokens=null,this._styleTokensConfigRef=null,this._styleTokensViewRef=null,this._lastSensorRender=0,this._sensorRenderTimer=null,this._inputTargetsRef=null,this._cachedInputTargets=new Set,this._holdTimer=null,this._dimTimer=null,this._dimEntity=null,this._dimTargets=[],this._dimLevel=0,this._dimDirs=new Map,this._holdFired=!1,this._dimFeedback=null,this._tapTimers=new Map,this._browseCache=new Map,this._uniqueIds=new Map,this._fetchQueue=[],this._fetchInFlight=0,this._maxConcurrentFetch=6,this._liveSeriesCache=new Map,this._graphDataCap=512,this._graphCommitPending=null,this._graphCommitTimer=null,this._graphCommitWindowMs=150}_borrowedReadyCount(){const e=this._config?.device_styles;if(!e)return 0;let t=0;for(const i of Object.values(e)){const e=i?.extra_sensors;if(Array.isArray(e))for(const i of e)this.hass.states[i]&&t++}return t}static getConfigElement(){return document.createElement("ha-device-dashboard-editor")}static getStubConfig(){return{type:"custom:ha-device-dashboard",...Mi()}}getGridOptions(){return{columns:"full",rows:"auto",min_columns:6,min_rows:4}}getLayoutOptions(){return{grid_columns:"full",grid_rows:"auto",grid_min_columns:6,grid_min_rows:3}}setConfig(e){this._config=Si(e);const t=e.style?.font_family??"";var i;i=t,Le.some(e=>i.includes(e.replace(/\+/g," ")))&&function(){if(Fs||"undefined"==typeof document)return;const e=Fe();if(!e)return;const t=document.createElement("link");t.rel="stylesheet",t.href=e,document.head.appendChild(t),Fs=!0}()}shouldUpdate(e){const t=e.get("hass"),i=function(e){const t=e.throttleMs??2e3,i=new Set(e.changedKeys),s=e=>({render:!0,reason:e,stampSensorRender:!1,scheduleIn:null});if(Ne.some(e=>i.has(e)))return s("local-state");if(!i.has("hass"))return s("non-hass");if(!e.oldStates||!e.newStates||!e.devices)return s("no-baseline");for(const t of e.inputTargets)if(e.oldStates[t]!==e.newStates[t])return s("input-target");let o=!1;for(const t of e.devices)for(const i of t.entities??[]){const t=i.entity_id;if(t&&e.oldStates[t]!==e.newStates[t]){if("sensor"!==i.domain)return s("interactive");o=!0}}if(!o)return{render:!1,reason:"none",stampSensorRender:!1,scheduleIn:null};const a=e.now-e.lastSensorRender;return a>=t?{render:!0,reason:"sensor-due",stampSensorRender:!0,scheduleIn:null}:{render:!1,reason:"sensor-throttled",stampSensorRender:!1,scheduleIn:t-a}}({changedKeys:e.keys(),oldStates:t?.states,newStates:this.hass?.states,devices:this._cachedDevices,inputTargets:this._inputTargets(),now:Date.now(),lastSensorRender:this._lastSensorRender});return i.stampSensorRender&&(this._lastSensorRender=Date.now()),null!=i.scheduleIn&&null==this._sensorRenderTimer&&(this._sensorRenderTimer=window.setTimeout(()=>{this._sensorRenderTimer=null,this._lastSensorRender=Date.now(),this.requestUpdate()},i.scheduleIn)),i.render}_inputTargets(){if(this._inputTargetsRef===this._config)return this._cachedInputTargets;const e=new Set;for(const t of Object.values(this._config?.device_styles??{}))for(const i of Object.values(t.input_actions??{})){for(const t of Ls(i.entity))e.add(t);for(const t of Ls(i.hold_action?.entity))e.add(t);for(const t of Ls(i.double_tap_action?.entity))e.add(t);i.select_chip?.entity&&e.add(i.select_chip.entity)}return this._inputTargetsRef=this._config,this._cachedInputTargets=e,e}getCardSize(){return 6}connectedCallback(){super.connectedCallback(),this._loadActiveView(),this._loadCustomizations()}willUpdate(){var e;if(e=this.hass?.language,tt=et(e),this._editPreviewChecked||!this._config)return;this._editPreviewChecked=!0;let t=!1;try{let e=this;const i=new Set;for(let s=0;e&&!i.has(e)&&s<60;s++){i.add(e);const s=e instanceof Element?e:null;if("hui-card-preview"===(s?.localName??"")||/element-preview/.test(String(s?.className||""))){t=!0;break}e=e.parentNode??e.getRootNode().host??null}}catch{}this.toggleAttribute("data-edit-preview",t)}disconnectedCallback(){super.disconnectedCallback(),this._endInputHold(),this._clearTapTimers(),this._graphFetching.clear(),this._graphFetchedAt.clear(),this._graphData=new Map,null!=this._graphCommitTimer&&(clearTimeout(this._graphCommitTimer),this._graphCommitTimer=null),this._graphCommitPending=null,this._periodEnergyFetching.clear(),this._periodEnergyQueue=[],this._periodEnergyInFlight=0,this._periodEnergyPending.clear(),null!=this._periodEnergyCommitTimer&&(clearTimeout(this._periodEnergyCommitTimer),this._periodEnergyCommitTimer=null),null!=this._sensorRenderTimer&&(clearTimeout(this._sensorRenderTimer),this._sensorRenderTimer=null),null!=this._trvBtnTimer&&(clearTimeout(this._trvBtnTimer),this._trvBtnTimer=null)}_getDevices(){if(!this.hass)return[];const e=this.hass.entities,t=this.hass.devices,i=this._borrowedReadyCount();if(this._cachedDevices&&e===this._cacheEntitiesRef&&t===this._cacheDevicesRef&&this._config===this._cacheConfigRef&&i===this._cacheBorrowedReady)return this._cachedDevices;this._cacheEntitiesRef=e,this._cacheDevicesRef=t,this._cacheConfigRef=this._config,this._cacheBorrowedReady=i,this._profileCache.clear();let s=_t(this.hass,{universal:"universal"===this._config.mode,scope:this._config.universal_scope,includeIntegrations:this._config.include_integrations,excludeIntegrations:this._config.exclude_integrations,includeDomains:this._config.include_domains,excludeDomains:this._config.exclude_domains},this._discoveryStats);s=function(e,t,i){if(!t)return e;if(!Object.values(t).some(e=>e?.extra_sensors?.length))return e;const s=new Map(e.map(e=>[e.device_id,e])),o=i.entities??{},a=i.devices??{};return e.map(e=>{const n=t[e.device_id]?.extra_sensors;if(!n?.length)return e;const r=new Set(e.entities.map(e=>e.entity_id)),l=[];for(const e of n){if(r.has(e))continue;const t=i.states[e];if(!t)continue;r.add(e);const n=o[e],c=n?.device_id,d=c?s.get(c)?.name??a[c]?.name_by_user??a[c]?.name:void 0;l.push(wt(e,n,t,{borrowed_from:d??"another device"}))}return l.length?{...e,entities:[...e.entities,...l]}:e})}(s,this._config.device_styles,this.hass);const o=this._config.areas;if(void 0!==o){const e=new Set(o.map(e=>e.toLowerCase()));s=s.filter(t=>e.has((t.area??"").toLowerCase()))}if(!1===this._config.show_offline&&(s=s.filter(e=>this._isOnline(e))),this._config.devices?.length){const e=new Set(this._config.devices);s=s.filter(t=>e.has(t.device_id))}if(this._config.hidden_devices?.length){const e=new Set(this._config.hidden_devices);s=s.filter(t=>!e.has(t.device_id))}return this._cachedDevices=s,s}_profile(e){let t=this._profileCache.get(e.device_id);if(!t){t=ei(e);const i=this._config.device_styles?.[e.device_id]?.profile;i&&i!==t.type&&(t={...t,type:i,label:Dt[i]}),this._profileCache.set(e.device_id,t)}return t}_getActiveView(){const e=this._config.views;if(!e?.length)return null;const t=this._activeViewId??this._config.default_view??e[0].id;return e.find(e=>e.id===t)??e[0]}_applyViewFilter(e,t){const i=t.filter;if(!i)return e;let s=e;if(i.profiles?.length){const e=new Set(i.profiles);s=s.filter(t=>e.has(this._profile(t).type))}if(i.domains?.length){const e=new Set(i.domains);s=s.filter(t=>t.entities.some(t=>e.has(t.domain)))}if(i.areas?.length){const e=new Set(i.areas.map(e=>e.toLowerCase()));s=s.filter(t=>e.has((t.area??"").toLowerCase()))}if(i.devices?.length){const e=new Set(i.devices);s=s.filter(t=>e.has(t.device_id))}if(i.exclude_devices?.length){const e=new Set(i.exclude_devices);s=s.filter(t=>!e.has(t.device_id))}if(i.entity_id_pattern){let e=null;try{e=new RegExp(i.entity_id_pattern)}catch{console.warn(`[ha-device-dashboard] invalid entity_id_pattern in view "${t.id}": ${i.entity_id_pattern}`)}e&&(s=s.filter(t=>t.entities.some(t=>e.test(t.entity_id))))}return s}_viewStorageKey(){return`shelly-dashboard:activeView:${this._config.title??"default"}`}_persistActiveView(){try{this._activeViewId&&localStorage.setItem(this._viewStorageKey(),this._activeViewId)}catch{}}_loadActiveView(){try{const e=localStorage.getItem(this._viewStorageKey());e&&(this._activeViewId=e)}catch{}}_setActiveView(e){this._activeViewId=e,this._persistActiveView()}_loadCustomizations(){try{this._delegateNoticeDismissed="1"===localStorage.getItem("hdd:delegateNoticeDismissed")}catch{}try{this._discoveryNoticeDismissed="1"===localStorage.getItem("hdd:discoveryNoticeDismissed")}catch{}}_dismissDelegateNotice(){this._delegateNoticeDismissed=!0;try{localStorage.setItem("hdd:delegateNoticeDismissed","1")}catch{}}_dismissDiscoveryNotice(){this._discoveryNoticeDismissed=!0;try{localStorage.setItem("hdd:discoveryNoticeDismissed","1")}catch{}}_renderDiscoveryNotice(){if(this._discoveryNoticeDismissed)return q``;const e=this._discoveryStats,t=e.notShelly,i=e.byIntegration+e.byScope+e.byDomain;if(!t&&!i)return q``;const s=this.preview||this.hasAttribute("data-edit-preview"),o=s?q`<button class="dn-link" @click=${e=>{e.stopPropagation(),window.dispatchEvent(new CustomEvent("hdd-editor-goto",{detail:{tab:"devices",section:"discovery",flash:"mode"}}))}}>${it("notice.discovery_link")}</button>`:q`<b>${it("notice.discovery_link")}</b>`,a=t?q`${it("notice.discovery_shelly",{n:t})}`:q`${it("notice.discovery_hidden",{n:i})}
          ${[e.byIntegration?it("notice.hidden_integration",{n:e.byIntegration}):"",e.byScope?it("notice.hidden_scope",{n:e.byScope}):"",e.byDomain?it("notice.hidden_domain",{n:e.byDomain}):""].filter(Boolean).join(", ")}${e.integrations.length?q` <span class="dn-dim">(${e.integrations.slice(0,3).join(", ")}${e.integrations.length>3?"…":""})</span>`:Y}.`;return q`
      <div class="delegate-notice">
        <span class="dn-icon">⌕</span>
        <span class="dn-text">${a}
          ${o} ${it(s?"notice.discovery_here":"notice.discovery_editor")}</span>
        <button class="dn-dismiss" title=${it("action.dismiss")}
          @click=${e=>{e.stopPropagation(),this._dismissDiscoveryNotice()}}>×</button>
      </div>`}_viewLookKey(){const e=this._getActiveView();return`${es(e??void 0)??""}|${e?.style?JSON.stringify(e.style):""}`}_styleTokens(){const e=this._getActiveView(),t=es(e??void 0),i=this._viewLookKey();if(this._styleTokensConfigRef===this._config&&this._styleTokensViewRef===i&&this._cachedStyleTokens)return this._cachedStyleTokens;const s=this._config.style??{};let o;if(t){const e={...s};for(const t of Ge)delete e[t];o={...qe(t),...e}}else{const e=qe(this._config.theme);o=e?{...e,...s}:s}return e?.style&&(o={...o,...e.style}),this._styleTokensConfigRef=this._config,this._styleTokensViewRef=i,this._cachedStyleTokens=o,o}_buildCardStyles(){const e=this._viewLookKey();if(this._cardStylesConfigRef===this._config&&this._cardStylesViewRef===e&&this._cachedCardStyles)return this._cachedCardStyles;const t=this._styleTokens(),i={};t.accent_color&&(i["--sc-accent"]=t.accent_color),t.tile_radius&&(i["--tile-radius"]=`${t.tile_radius}px`),t.tile_gap&&(i["--tile-gap"]=`${t.tile_gap}px`),t.font_family&&(i["--sc-font-family"]=t.font_family),t.text_size_scale&&(i["--sc-text-scale"]=String(t.text_size_scale)),t.tile_bg&&(i["--sc-tile-bg"]=t.tile_bg),t.tile_bg_image&&(i["--sc-tile-bg-image"]=`url("${t.tile_bg_image}")`),t.tile_bg_image_size&&(i["--sc-tile-bg-image-sz"]="stretch"===t.tile_bg_image_size?"100% 100%":t.tile_bg_image_size),this._config.card_bg_image&&(i["--sc-card-bg-image"]=`url("${this._config.card_bg_image}")`),this._config.card_bg_image_size&&(i["--sc-card-bg-image-sz"]="stretch"===this._config.card_bg_image_size?"100% 100%":this._config.card_bg_image_size),t.tile_border&&(i["--sc-tile-border"]=t.tile_border),null!=t.tile_border_width&&(i["--sc-tile-border-width"]=`${t.tile_border_width}px`),t.tile_hover_bg&&(i["--sc-tile-hover-bg"]=t.tile_hover_bg),t.tile_hover_shadow&&(i["--sc-tile-hover-shad"]=t.tile_hover_shadow),t.tile_sensor_bg&&(i["--sc-sensor-bg"]=t.tile_sensor_bg),t.tile_exp_bg&&(i["--sc-tile-exp-bg"]=t.tile_exp_bg),null!=t.card_radius&&(i["--sc-card-radius"]=`${t.card_radius}px`),t.text_primary&&(i["--sc-text-primary"]=t.text_primary),t.text_secondary&&(i["--sc-text-secondary"]=t.text_secondary),t.text_muted&&(i["--sc-text-muted"]=t.text_muted),t.offline_color&&(i["--sc-offline-dot"]=t.offline_color),t.online_color&&(i["--sc-online-color"]=t.online_color),t.power_color&&(i["--sc-power-color"]=t.power_color),t.area_header_color&&(i["--sc-area-header-color"]=t.area_header_color),this._config.graph_line_color&&(i["--sc-graph-line"]=this._config.graph_line_color);t.tile_box_shadow&&"none"!==t.tile_box_shadow?i["--sc-tile-shadow"]={soft:"0 2px 8px rgba(0,0,0,0.25)",medium:"0 4px 16px rgba(0,0,0,0.40)",strong:"0 8px 28px rgba(0,0,0,0.60)"}[t.tile_box_shadow]??"none":"none"===t.tile_box_shadow&&(i["--sc-tile-shadow"]="none");const s=t.button_shape??"pill",o=t.button_variant??"fill",a=t.button_size??"md",n={sm:"2px 8px",md:"4px 11px",lg:"6px 16px"},r={sm:"3px 5px",md:"4px 8px",lg:"6px 12px"},l="square"===s||"circle"===s;i["--tog-radius"]="pill"===s?"20px":"rect"===s||"square"===s?"6px":"50%",i["--tog-pad"]=l?r[a]??r.md:n[a]??n.md,i["--tog-fsize"]="sm"===a?".65em":"lg"===a?".8em":".72em",i["--tog-aspect"]=l?"1":"auto","outline"===o?(i["--tog-on-bg"]="transparent",i["--tog-on-border"]="1px solid var(--sc-accent)",i["--tog-on-color"]="var(--sc-accent)",i["--tog-on-shadow"]="none"):"ghost"===o&&(i["--tog-on-bg"]="transparent",i["--tog-on-border"]="none",i["--tog-on-color"]="var(--sc-accent)",i["--tog-on-shadow"]="none"),t.header_bg&&t.header_bg2?i["--sc-header-bg"]=`linear-gradient(135deg, ${t.header_bg} 0%, ${t.header_bg2} 100%)`:t.header_bg&&(i["--sc-header-bg"]=t.header_bg),t.header_text_color&&(i["--sc-header-text"]=t.header_text_color),t.header_orb_color&&(i["--sc-header-orb2"]=t.header_orb_color),void 0!==t.header_icon&&(i["--sc-header-icon"]=`'${t.header_icon}'`),t.header_title_size&&(i["--sc-header-title-size"]=`${t.header_title_size}em`),null!=t.header_radius&&(i["--sc-header-radius"]=`${t.header_radius}px`),null!=t.header_padding&&(i["--sc-header-padding"]=`${t.header_padding}px`),t.header_border_color&&(i["--sc-header-border-color"]=t.header_border_color),null!=t.header_border_width&&(i["--sc-header-border-width"]=`${t.header_border_width}px`),t.header_stat_online&&(i["--sc-hstat-online"]=t.header_stat_online),t.header_stat_power&&(i["--sc-hstat-power"]=t.header_stat_power),t.header_stat_offline&&(i["--sc-hstat-offline"]=t.header_stat_offline),(this._config.header_show_orbs??this._config.effects)||(i["--sc-header-orb-opacity"]="0");const c=this._config.header_opacity??100;c<100&&(i["--sc-header-opacity"]=String(c/100));const d=t.card_bg??"var(--ha-card-background, #1c1c1e)";t.card_bg&&(i["--sc-card-bg"]=t.card_bg);const p=this._config.card_opacity??100;p<100&&(i["--sc-card-bg"]=`color-mix(in srgb, ${d} ${p}%, transparent)`);const h=this._config.tile_opacity??100;return h<100&&(i["--sc-tile-bg-opacity"]=String(h/100)),this._cardStylesConfigRef=this._config,this._cardStylesViewRef=this._viewLookKey(),this._cachedCardStyles=i,i}_groupByArea(e){const t=new Map;for(const i of e){const e=i.area??"";t.has(e)||t.set(e,[]),t.get(e).push(i)}const i=(s=this._config,o=this._getActiveView()??void 0,o?.sort_by??s.sort_by??"name");var s,o;let a;if("power"===i){const t=new Map(e.map(e=>[e.device_id,this._getPower(e)??-1]));a=(e,i)=>t.get(i.device_id)-t.get(e.device_id)}else if("area"===i){const t=new Map(e.map(e=>[e.device_id,e.area||"￿"]));a=(e,i)=>t.get(e.device_id).localeCompare(t.get(i.device_id))||e.name.localeCompare(i.name)}else if("online"===i){const t=new Map(e.map(e=>[e.device_id,this._isOnline(e)?1:0]));a=(e,i)=>t.get(i.device_id)-t.get(e.device_id)||e.name.localeCompare(i.name)}else a=(e,t)=>e.name.localeCompare(t.name);return new Map([...t.entries()].sort(([e],[t])=>e?t?e.localeCompare(t):-1:1).map(([e,t])=>[e,t.sort(a)]))}_isOnline(e){return os(e,this.hass.states)}_getPower(e){let t=0,i=!1;for(const s of e.entities){const e=this.hass.states[s.entity_id];if(!e)continue;const o=e.attributes;if(null!=o.current_power_w){const e=Number(o.current_power_w);isNaN(e)||(t+=e,i=!0);continue}if("sensor"===s.domain&&"power"===o.device_class){const s=parseFloat(e.state);isNaN(s)||(t+=s,i=!0)}}return i?t:null}static _isConfigSwitch(e){return/aioshelly_ble|ble_integration|bluetooth_gateway/i.test(e)}_getPrimarySwitch(e){const t=e=>"light"===e.domain?0:Bs._isConfigSwitch(e.entity_id)?3:/_switch_\d|_relay|_output/i.test(e.entity_id)?1:2,i=e.entities.filter(e=>("switch"===e.domain||"light"===e.domain)&&this.hass.states[e.entity_id]).sort((e,i)=>t(e)-t(i));for(const e of i){const t=this.hass.states[e.entity_id];if(!t)continue;const i=t.attributes;let s,o,a,n;if("light"===e.domain){s="on"===t.state&&null!=i.brightness?Math.round(i.brightness/Bs.BRIGHTNESS_MAX*100):0;const e=i.supported_color_modes??[];if(e.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(o=e),i.rgbw_color){const[e,t,s,o]=i.rgbw_color;a=[e,t,s],n=o}else i.rgb_color&&(a=i.rgb_color)}return{entityId:e.entity_id,isOn:"on"===t.state,brightness:s,colorModes:o,rgbColor:a,whiteValue:n}}return null}_getTrv(e){const t=e.entities.find(e=>"climate"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];if(!i)return null;const s=i.attributes;let o=s.current_valve_position??s.valve_position;if(null==o){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("valve"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(o=e)}}return{entityId:t.entity_id,currentTemp:s.current_temperature,targetTemp:s.temperature,minTemp:s.min_temp??4,maxTemp:s.max_temp??30,step:s.target_temp_step??.5,hvacMode:i.state,hvacAction:s.hvac_action??i.state,presetMode:s.preset_mode,presetModes:(s.preset_modes??[]).filter(e=>"none"!==e),valvePosition:o}}_getCover(e){const t=e.entities.find(e=>"cover"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];return i?{entityId:t.entity_id,state:i.state,position:i.attributes?.current_position}:null}_getValve(e){const t=e.entities.find(e=>"valve"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];if(!i)return null;const s=!!(4&(i.attributes?.supported_features??0));let o=i.attributes?.current_position;if(null==o){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("position"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(o=e)}}const a=e.entities.find(e=>{if("number"!==e.domain)return!1;const t=this.hass.states[e.entity_id];if(!t)return!1;const i=t.attributes;return 0===i.min&&100===i.max||e.entity_id.includes("position")});let n;const r=e.entities.find(e=>"sensor"===e.domain&&"temperature"===this.hass.states[e.entity_id]?.attributes?.device_class);if(r){const e=parseFloat(this.hass.states[r.entity_id]?.state??"");isNaN(e)||(n=e)}return{entityId:t.entity_id,state:i.state,position:o,supportsPosition:s,numEntityId:a?.entity_id,temperature:n}}async _setValvePosition(e,t,i){const s=Math.round(Math.max(0,Math.min(100,t)));i?await this.hass.callService("number","set_value",{entity_id:i,value:s}):await this.hass.callService("valve","set_valve_position",{entity_id:e,position:s})}_getAlerts(e){return as(e,this.hass.states)}_getFirmware(e){const t=!0===this._config.include_beta_updates;for(const i of e.entities){if("update"!==i.domain)continue;const e=this.hass.states[i.entity_id];if(!e||"on"!==e.state)continue;const s=e.attributes;if(t||!ds(i.entity_id,s))return{entityId:i.entity_id,current:s.installed_version??"",newVersion:s.latest_version}}return null}_chLabel(e){const t=e.match(/[_-]([abc])[_-](?:act_power|aprt_power|ret_power|voltage|current|pf|freq)/i);if(t)return t[1].toUpperCase();const i=e.match(/[_-](?:switch|channel|ch|output)_?(\d+)[_-]/i)??e.match(/[_-](\d+)[_-](?:power|energy|voltage|current|apparent|reactive|factor|freq)/i)??e.match(/(?:power|energy|voltage|current|freq|apparent|reactive)[_-](\d+)$/i);return i?"Ch "+(+i[1]+1):""}_timeAgo(e){if(!e)return it("time.never");const t=Date.now()-new Date(e).getTime();return isNaN(t)||t<0?it("time.never"):t<6e4?it("time.just_now"):t<36e5?it("time.minutes_ago",{n:Math.floor(t/6e4)}):t<864e5?it("time.hours_ago",{n:Math.floor(t/36e5)}):it("time.days_ago",{n:Math.floor(t/864e5)})}_sensorSelection(e){return function(e){const t=ji(e)?.sensors;if(void 0!==t)return t;const i=Hi(e)?.sensors;if(void 0!==i)return i;const s=Ui(e)?.sensors;if(void 0!==s)return s;const o=e.view?.sensors;if(void 0!==o)return o;const a=Yi(e)?.sensors;if(void 0!==a)return a;const n=e.config.style_presets?.[Ki(e)]?.sensors;return void 0!==n?n:void 0!==e.config.sensors?e.config.sensors:Ft[e.profile]}(this._cascade(e))}_getSensors(e,t=!1){const i=this._sensorSelection(e),s=t||void 0===i?null:new Set(i),o=e=>!s||s.has(e),a=[],n=new Set,r=t?[]:bs(e,i),l=new Set(r.map(e=>e.entity_id)),c=new Set(["voltage","current","frequency","power_factor","apparent_power","reactive_power"]),d=new Set(["ip","ssid","fw_version","mac","rssi","uptime","cloud","mqtt","eth"]),p=e=>c.has(e)?"electrical":d.has(e)?"diag":"primary",h=new Set(["power","energy","current","voltage","apparent_power","reactive_power","power_factor","frequency"]),u=new Map;for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes?.device_class??"";h.has(i)&&(u.has(i)||u.set(i,[]),u.get(i).push(t.entity_id))}const g=new Set([...u.entries()].filter(([,e])=>e.length>1).map(([e])=>e)),v=this._config.device_styles?.[e.device_id]?.energy_entity,f=(e,t,i,s=!1,o,r)=>{const l=o&&g.has(e)?this._chLabel(o):"",c=l?`${e}_${l}`:e;n.has(c)||(n.add(c),a.push({label:t,value:i,warn:s,key:e,tier:r??p(e),ch:l}))};for(const t of r){const i=this.hass.states[t.entity_id];if(!i||"unavailable"===i.state||"unknown"===i.state)continue;const s=i.attributes,o=s.unit_of_measurement??"",r=parseFloat(i.state),l=isNaN(r)?i.state:xi(r,o),c=Li(s.friendly_name??"",e.name)||t.entity_id.split(".")[1]?.replace(/_/g," ")||t.entity_id;n.has(t.entity_id)||(n.add(t.entity_id),a.push({label:c,value:l,warn:!1,key:t.entity_id,tier:"primary",ch:""}))}for(const t of e.entities){const i=this.hass.states[t.entity_id];if(!i||"unavailable"===i.state||"unknown"===i.state)continue;if(l.has(t.entity_id))continue;const s=i.attributes.device_class??"",a=t.entity_id;if("sensor"===t.domain){if(!s&&(a.endsWith("_ip")||a.endsWith("_ip_address"))&&o("ip")){f("ip","IP",i.state);continue}if(!s&&a.endsWith("_ssid")&&o("ssid")){f("ssid","SSID",i.state);continue}if(!s&&(a.endsWith("_firmware")||a.endsWith("_fw"))&&o("fw_version")){f("fw_version","FW",i.state);continue}if(!s&&a.endsWith("_mac")&&o("mac")){f("mac","MAC",i.state);continue}const t=parseFloat(i.state);if(isNaN(t))continue;if("power"===s&&o("power"))f("power",it("chip.power"),ni(t),!1,a);else if("apparent_power"===s&&o("apparent_power"))f("apparent_power",it("chip.apparent_power"),ui(t),!1,a);else if("reactive_power"===s&&o("reactive_power"))f("reactive_power",it("chip.reactive_power"),gi(t),!1,a);else if("power_factor"===s&&o("power_factor"))f("power_factor",it("chip.power_factor"),yi(t),!1,a);else if("frequency"===s&&o("frequency"))f("frequency",it("chip.frequency"),vi(t),!1,a);else if("energy"===s&&o("energy")&&!v){const i=this._energyChip(e,a,t);i&&f("energy",i.label,i.value,!1,a)}else"voltage"===s&&o("voltage")?f("voltage",it("chip.voltage"),li(t),!1,a):"current"===s&&o("current")?f("current",it("chip.current"),ci(t),!1,a):"temperature"===s&&o("temperature")?f("temperature",it("chip.temperature"),di(t)):"humidity"===s&&o("humidity")?f("humidity",it("chip.humidity"),fi(t)):"illuminance"===s&&o("illuminance")?f("illuminance",it("chip.illuminance"),mi(t)):"carbon_dioxide"===s&&o("co2")?f("co2","CO₂",bi(t)):"gas"===s&&o("gas")?f("gas",it("chip.gas"),`${t.toFixed(1)} %`):"battery"===s&&o("battery")?f("battery",it("chip.battery"),yi(t)):("signal_strength"===s||a.includes("rssi"))&&o("rssi")?f("rssi",it("chip.rssi"),`${t} dBm`):a.includes("uptime")&&o("uptime")&&f("uptime",it("chip.uptime"),pi(t))}else if("binary_sensor"===t.domain){const e="on"===i.state,t=e=>e?"primary":"diag";"motion"===s&&o("motion")?f("motion",it("chip.motion"),it(e?"state.motion":"state.clear"),e,void 0,t(e)):"door"!==s&&"window"!==s&&"opening"!==s||!o("door")?"moisture"===s&&o("flood")?f("flood",it("chip.flood"),it(e?"state.flooded":"state.dry"),e,void 0,t(e)):"smoke"===s&&o("smoke")?f("smoke",it("chip.smoke"),it(e?"state.smoke":"state.clear"),e,void 0,t(e)):"gas"===s&&o("gas")?f("gas",it("chip.gas"),it(e?"state.gas":"state.clear"),e,void 0,t(e)):"vibration"===s&&o("vibration")?f("vibration",it("chip.vibration"),it(e?"state.vibrating":"state.clear"),e,void 0,t(e)):("heat"===s||a.includes("overtemp"))&&o("overtemp")?f("overtemp",it("chip.overtemp"),it(e?"state.overtemp":"state.ok"),e,void 0,t(e)):("safety"===s||a.includes("overpower"))&&o("overpower")?f("overpower",it("chip.overpower"),it(e?"state.overpower":"state.ok"),e,void 0,t(e)):"connectivity"===s&&a.includes("cloud")&&o("cloud")?f("cloud",it("chip.cloud"),it(e?"state.connected":"state.offline"),!e,void 0,t(!e)):"connectivity"===s&&a.includes("mqtt")&&o("mqtt")?f("mqtt","MQTT",it(e?"state.connected":"state.offline"),!e,void 0,t(!e)):"connectivity"===s&&a.includes("eth")&&o("eth")&&f("eth",it("chip.ethernet"),it(e?"state.connected":"state.offline"),!e,void 0,t(!e)):f("door",it("chip.door"),it(e?"state.open":"state.closed"),!1,void 0,t(e))}}if(v&&o("energy")){const t=this.hass.states[v];if(t&&"unavailable"!==t.state&&"unknown"!==t.state){const i=parseFloat(t.state),s=this._energyChip(e,v,isNaN(i)?null:i);s&&f("energy",s.label,s.value)}}return a}_getInputChannels(e){return Ni(e,this.hass.states)}_inputAction(e,t){const i=this._config.device_styles?.[e.device_id]?.input_actions,s=i?.[t.entityId]??i?.[String(t.channel)];return s?"none"!==s.action?s:null:t.output?{action:"toggle",entity:t.output}:null}_inputActionLabel(e,t,i){if(e.label)return e.label;if("press"===e.action)return i?.label??it("tile.press");const s=Ls(e.entity),o="perform-action"!==e.action||2!==e.perform_action?.split(".").length||e.perform_action.endsWith(".turn_on")||e.perform_action.endsWith(".turn_off")?s[0]:e.perform_action;let a=o?this.hass.states[o]?.attributes?.friendly_name:void 0;a&&t&&(a=Li(a,t.name)||t.name);const n=a??o??e.perform_action??"Run";return s.length>1?`${n} +${s.length-1}`:n}_entityShortName(e){const t=this.hass.states[e]?.attributes?.friendly_name;if(!t)return e;const i=this.hass,s=i.devices?.[i.entities?.[e]?.device_id??""];return Li(t,s?.name_by_user??s?.name)||t}_inputSelectChip(e,t){const i=this._inputAction(e,t)?.select_chip;if(!i?.entity)return null;const s=this.hass.states[i.entity];if(!s)return null;const o=s.attributes?.options??[];return o.length?{entity:i.entity,label:i.label??this._entityShortName(i.entity),options:o,current:s.state}:null}_startInputHold(e,t,i){const s=this._inputAction(e,t),o=s?.hold_action;s&&o&&"none"!==o.action&&(this._holdFired=!1,this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=window.setTimeout(()=>this._beginInputHold(e,t,s,o),400))}_beginInputHold(e,t,i,s){if(this._holdTimer=null,this._holdFired=!0,"dim"!==s.action)return void this._performAction({action:s.action,entity:s.entity??i.entity,perform_action:s.perform_action,data:s.data},e,t,"long");const o=Ls(s.entity??i.entity);if(!o.length)return;const a=o.join(","),n=this._dimDirs.get(a)??1,r=Number(this.hass.states[o[0]]?.attributes?.brightness??0);this._dimEntity=a,this._dimTargets=o,this._dimLevel=r>0?r:n>0?3:255;const l=Math.max(1,Math.round(2.55*(s.step??5))),c=()=>{this._dimEntity&&(this._dimLevel=Math.max(3,Math.min(255,this._dimLevel+n*l)),this._dimFeedback={key:t.entityId,dir:n,pct:Math.round(this._dimLevel/255*100)},this.hass.callService("light","turn_on",{entity_id:this._dimTargets,brightness:this._dimLevel}),(this._dimLevel>=255||this._dimLevel<=3)&&this._stopDim())};c(),this._dimTimer=window.setInterval(c,s.interval??200)}_stopDim(){this._dimTimer&&(clearInterval(this._dimTimer),this._dimTimer=null)}_endInputHold(){if(this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._dimEntity){const e=this._dimDirs.get(this._dimEntity)??1;this._dimDirs.set(this._dimEntity,e>0?-1:1),this._dimEntity=null,this._dimTargets=[]}this._stopDim(),this._dimFeedback=null}_inputActionState(e,t){const i=this._inputAction(e,t);if(!i||"toggle"!==i.action)return null;const s=Ls(i.entity);if(!s.length)return null;let o=!1;for(const e of s){const t=this.hass.states[e];if(t&&"unavailable"!==t.state&&"unknown"!==t.state&&(o=!0,"on"===t.state))return"on"}return o?"off":"unavailable"}_runInputAction(e,t,i){if(i.stopPropagation(),this._holdFired)return void(this._holdFired=!1);const s=this._inputAction(e,t);if(!s)return;const o=s.double_tap_action;if(!o||"none"===o.action)return void this._performAction(s,e,t);const a=this._tapTimers.get(t.entityId);if(null!=a)return clearTimeout(a),this._tapTimers.delete(t.entityId),void this._performAction({action:o.action,entity:o.entity??s.entity,perform_action:o.perform_action,data:o.data},e,t,"double");this._tapTimers.set(t.entityId,window.setTimeout(()=>{this._tapTimers.delete(t.entityId),this._performAction(s,e,t)},250))}_clearTapTimers(){for(const e of this._tapTimers.values())clearTimeout(e);this._tapTimers.clear()}_performAction(e,t,i,s="single"){if("press"!==e.action)if("more-info"!==e.action){if("toggle"===e.action){const t=Ls(e.entity);if(!t.length)return;return void this.hass.callService("homeassistant","toggle",{entity_id:t})}if("perform-action"===e.action&&e.perform_action){const[t,i]=e.perform_action.split(".");if(!t||!i)return;const s={...e.data??{}},o=Ls(e.entity);o.length&&(s.entity_id=o),this.hass.callService(t,i,s)}}else Re(this,"hass-more-info",{entityId:Ls(e.entity)[0]??i.entityId});else this._replayPress(t,i,s)}_requestBrowse(e){const t=this._browseCache.get(e);if("pending"===t||t&&Date.now()-t.at<3e5)return;this._browseCache.set(e,"pending");const i=(t={})=>this.hass.callWS({type:"media_player/browse_media",entity_id:e,...t}),s=e=>(e??[]).filter(e=>e.can_play).map(e=>({title:e.title,id:e.media_content_id,type:e.media_content_type}));(async()=>{const t=[];try{const e=await i(),o=s(e.children);o.length&&t.push({label:e.title||it("media.default_group"),items:o});for(const o of(e.children??[]).filter(e=>e.can_expand&&!e.can_play).slice(0,4))try{const e=await i({media_content_id:o.media_content_id,media_content_type:o.media_content_type}),a=s(e.children).slice(0,60);a.length&&t.push({label:o.title,items:a})}catch{}}catch{}this._browseCache.set(e,{at:Date.now(),groups:t}),this.requestUpdate()})()}_getBrowseGroups(e){const t=this._browseCache.get(e);return t?"pending"===t?"pending":t.groups:null}_uniqueId(e){let t=this._uniqueIds.get(e);return t||(t=this.hass.callWS({type:"config/entity_registry/get",entity_id:e}).then(e=>e?.unique_id??null).catch(()=>null),this._uniqueIds.set(e,t)),t}async _replayPress(e,t,i){const s=this.hass.states[t.entityId]?.attributes?.event_types,o=function(e){const t=t=>(e??[]).find(e=>t.test(e));return{single:t(/^single(_push)?$/),double:t(/^double(_push)?$/),long:t(/^long(_push)?$/)}}(s)[i];if(!o)return void Re(this,"hass-notification",{message:`${t.label}: this input reports no ${i} press to replay`});const a=ti(e.model??"",e.hw_version,e.model_id),n=this._inputAction(e,t)?.channel??function(e,t,i){if(i){const e=i.match(/-input:(\d+)$/);if(e)return parseInt(e[1],10)+1;const t=i.match(/-(\d+)$/);if(t)return parseInt(t[1],10)}const s=Ri(e);return null==s?1:1===t?s:s+1}(t.entityId,a,await this._uniqueId(t.entityId)),r={device_id:e.device_id,channel:n,click_type:o,generation:1===a?1:2},l=function(e){for(const t of e.entities){const e=t.entity_id.match(/^[a-z_]+\.(shelly[a-z0-9]*_[0-9a-f]{6,12})_/);if(e)return e[1].replace("_","-")}}(e);l&&(r.device=l);try{await this.hass.callWS({type:"fire_event",event_type:"shelly.click",event_data:r})}catch(e){console.warn("[ha-device-dashboard] could not replay press",e),Re(this,"hass-notification",{message:it("error.replay_needs_admin")})}}async _toggle(e,t,i,s){i.stopPropagation(),t&&s&&this._config.device_styles?.[s.device_id]?.confirm_off?this._confirmOff={entityId:e,name:s.name}:await this._applyToggle(e,t)}async _applyToggle(e,t){const i=e.split(".")[0];await this.hass.callService(i,t?"turn_off":"turn_on",{entity_id:e})}_renderConfirmOff(){const e=this._confirmOff;if(!e)return Y;const t=()=>{this._confirmOff=null};return q`
      <div class="cf-backdrop" @click=${t}>
        <div class="cf-box" role="alertdialog" aria-modal="true" aria-label=${it("confirm.aria")}
          @click=${e=>e.stopPropagation()}>
          <div class="cf-title">${it("confirm.title",{name:e.name})}</div>
          <div class="cf-sub">${it("confirm.body")}</div>
          <div class="cf-actions">
            <button class="cf-cancel" @click=${t}>${it("action.cancel")}</button>
            <button class="cf-go" @click=${async()=>{const t=e;this._confirmOff=null,await this._applyToggle(t.entityId,!0)}}>${it("action.turn_off")}</button>
          </div>
        </div>
      </div>`}async _setBrightness(e,t){await this.hass.callService("light","turn_on",{entity_id:e,brightness_pct:Math.max(1,Math.min(100,t))})}_rgbToHex(e,t,i){return"#"+[e,t,i].map(e=>e.toString(16).padStart(2,"0")).join("")}_hexToRgb(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}async _setColor(e,t,i,s=!1){const o=this._hexToRgb(t);s&&void 0!==i?await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...o,i]}):await this.hass.callService("light","turn_on",{entity_id:e,rgb_color:o})}async _coverAction(e,t,i){i.stopPropagation();await this.hass.callService("cover",{open:"open_cover",close:"close_cover",stop:"stop_cover"}[t],{entity_id:e})}async _setCoverPosition(e,t){await this.hass.callService("cover","set_cover_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}async _valveAction(e,t,i){i.stopPropagation();await this.hass.callService("valve",{open:"open_valve",close:"close_valve",stop:"stop_valve"}[t],{entity_id:e})}async _setTemp(e,t){await this.hass.callService("climate","set_temperature",{entity_id:e,temperature:Math.round(2*t)/2})}async _setHvacMode(e,t,i){i.stopPropagation(),await this.hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_setPresetMode(e,t){this.hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}async _installUpdate(e,t){t.stopPropagation(),await this.hass.callService("update","install",{entity_id:e})}async _selectOption(e,t){await this.hass.callService("select","select_option",{entity_id:e,option:t})}async _setNumberValue(e,t){await this.hass.callService("number","set_value",{entity_id:e,value:String(t)})}async _pressButton(e,t){t.stopPropagation(),await this.hass.callService("button","press",{entity_id:e})}_showGraphs(e){return function(e){const t=ji(e)?.show_graphs;if(void 0!==t)return t;const i=Hi(e)?.show_graphs;if(void 0!==i)return i;const s=Ui(e)?.show_graphs;if(void 0!==s)return s;const o=e.view?.show_graphs;return void 0!==o?o:e.config.show_graphs??!1}(this._cascade(e))}_getGraphEntities(e){return this._showGraphs(e)?this._graphSensorEntities(e):[]}_graphSensorEntities(e){const t=this._config.graph_sensors??Nt;if(!t.length)return[];const i=[];for(const s of bs(e,t)){const t=this.hass.states[s.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const o=t.attributes,a=o.unit_of_measurement??"",n=Li(o.friendly_name??"",e.name)||s.entity_id.split(".")[1]?.replace(/_/g," ")||s.entity_id;i.push({entityId:s.entity_id,label:n,dc:o.device_class??"",unit:a})}const s=fs(t).map(Ai),o=new Set(i.map(e=>e.entityId));for(const t of s){const s=e.entities.filter(e=>{if("sensor"!==e.domain)return!1;if(o.has(e.entity_id))return!1;const i=this.hass.states[e.entity_id];if(!i||"unavailable"===i.state||"unknown"===i.state)return!1;return(i.attributes?.device_class??e.attributes?.device_class)===t||"signal_strength"===t&&e.entity_id.includes("rssi")}),a=new Set;for(const e of s){const o=this.hass.states[e.entity_id]?.attributes?.unit_of_measurement??"",n=s.length>1?this._chLabel(e.entity_id).replace("Ch ",""):"",r=st(`graph.${t}`,_i[t]??t)+(n?` ${n}`:"");a.has(r)||(a.add(r),i.push({entityId:e.entity_id,label:r,dc:t,unit:o}))}}return i}_gk(e,t){return`${e}::${t}`}_seriesWithLive(e,t){const i=this._graphData.get(this._gk(e,t));if(!i?.length)return i;const s=this.hass.states[e],o=parseFloat(s?.state??"");if(isNaN(o))return i;const a=Date.parse(s.last_updated??"")||0;if(!(a>i[i.length-1].t))return i;const n=this._gk(e,t),r=this._liveSeriesCache.get(n);if(r&&r.src===i&&r.lu===s.last_updated)return r.out;const l=[...i,{t:a,v:o,live:!0}];return this._liveSeriesCache.set(n,{src:i,lu:s.last_updated,out:l}),l}_requestGraphData(e,t){const i=t??this._config.graph_hours??24,s=this._gk(e,i);if(this._graphFetching.has(s))return;Date.now()-(this._graphFetchedAt.get(s)??0)<((this._graphData.get(s)?.length??0)>=2?i>=168?18e5:3e5:3e4)&&this._graphData.has(s)||(this._fetchQueue.includes(s)||this._fetchQueue.push(s),this._drainFetchQueue())}_drainFetchQueue(){for(;this._fetchInFlight<this._maxConcurrentFetch&&this._fetchQueue.length>0;){const e=this._fetchQueue.shift();this._fetchInFlight++,this._fetchGraphData(e).finally(()=>{this._fetchInFlight--,this._drainFetchQueue()})}}_retryGraphData(e,t){const i=t??this._config.graph_hours??24,s=this._gk(e,i);if(this._graphFetching.has(s))return;this._graphFetchedAt.delete(s);const o=new Map(this._graphData);o.delete(s),this._graphData=o,this._fetchQueue=this._fetchQueue.filter(e=>e!==s),this._requestGraphData(e,i)}async _fetchStatistics(e,t,i){try{const s=i??(t>48?"hour":"5minute"),o=await this.hass.callWS({type:"recorder/statistics_during_period",start_time:new Date(Date.now()-36e5*t).toISOString(),statistic_ids:[e],period:s,types:["mean","state","min","max"]}),a=o?.[e];if(!a?.length)return null;const n=a.map(e=>({t:"number"==typeof e.start?e.start:new Date(e.start).getTime(),v:e.mean??e.state??e.max})).filter(e=>null!=e.v&&!isNaN(e.v));return n.length>=2?n:null}catch{return null}}async _fetchRawHistory(e,t){const i=new Date(Date.now()-36e5*t),s=new Date,o=`history/period/${i.toISOString()}?filter_entity_id=${e}&end_time=${encodeURIComponent(s.toISOString())}&minimal_response=true&no_attributes=true`,a=await this.hass.callApi("GET",o),n=(a?.[0]??[]).map(e=>({t:new Date(e.last_changed).getTime(),v:parseFloat(e.state)})).filter(e=>!isNaN(e.v));if(1===n.length){const t=parseFloat(this.hass.states[e]?.state??"");n.push({t:Date.now(),v:isNaN(t)?n[0].v:t})}return n}_energyPeriod(e){return function(e){return ji(e)?.energy_period??Hi(e)?.energy_period??Ui(e)?.energy_period??e.view?.energy_period??e.config.energy_period??"total"}(this._cascade(e))}_energyEntitiesFor(e){const t=this._config.device_styles?.[e.device_id]?.energy_entity;return t?[t]:e.entities.filter(e=>is(e)&&"sensor"===e.domain&&"energy"===this.hass.states[e.entity_id]?.attributes?.device_class).map(e=>e.entity_id)}_statsTimeZone(){return this.hass?.config?.time_zone||Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"}_tzOffsetMs(e,t){const i={};for(const s of new Intl.DateTimeFormat("en-US",{timeZone:e,hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(t))i[s.type]=s.value;return Date.UTC(+i.year,+i.month-1,+i.day,+i.hour%24,+i.minute,+i.second)-t.getTime()+t.getTime()%1e3}_zonedMidnight(e,t,i,s){const o=Date.UTC(t,i,s);let a=o-this._tzOffsetMs(e,new Date(o));return a=o-this._tzOffsetMs(e,new Date(a)),new Date(a)}_periodStart(e){if("total"===e)return null;const t=this._statsTimeZone(),i=new Date(Date.now()+this._tzOffsetMs(t,new Date)),s=i.getUTCFullYear(),o=i.getUTCMonth(),a=i.getUTCDate();if("today"===e)return{start:this._zonedMidnight(t,s,o,a),stat:"day"};if("month"===e)return{start:this._zonedMidnight(t,s,o,1),stat:"month"};if("week"===e){const e=(i.getUTCDay()+6)%7;return{start:this._zonedMidnight(t,s,o,a-e),stat:"week"}}return null}_energyPeriodLabel(e){return it("today"===e?"energy.today":"week"===e?"energy.week":"month"===e?"energy.month":"energy.total")}_energyChip(e,t,i){const s=this._energyPeriod(e),o=null==i?null:{label:it("energy.total"),value:ri(i)};if("total"===s)return o;const a=this._periodEnergyValue(t,s);return a.failed?o:null==a.kwh?{label:this._energyPeriodLabel(s),value:"…"}:{label:this._energyPeriodLabel(s),value:ri(a.kwh)}}_periodEnergyValue(e,t){if("total"===t)return{kwh:null,failed:!1};const i=`${e}|${t}`,s=this._periodEnergy.get(i)??null;if(null!=s&&Date.now()-(this._periodEnergyAt.get(i)??0)<Bs.PERIOD_ENERGY_TTL)return{kwh:s,failed:!1};const o=Date.now()-(this._periodEnergyErrAt.get(i)??0);return this._periodEnergyErrAt.has(i)&&o<Bs.PERIOD_ENERGY_RETRY?{kwh:s,failed:null==s}:(this._requestPeriodEnergy(e,t),{kwh:s,failed:!1})}_requestPeriodEnergy(e,t){const i=`${e}|${t}`;this._periodEnergyFetching.has(i)||this._periodEnergyQueue.includes(i)||(this._periodEnergyQueue.push(i),this._drainPeriodEnergyQueue())}_drainPeriodEnergyQueue(){for(;this._periodEnergyInFlight<this._maxPeriodEnergyFetch&&this._periodEnergyQueue.length>0;){const e=this._periodEnergyQueue.shift();this._periodEnergyInFlight++,this._fetchPeriodEnergy(e).finally(()=>{this._periodEnergyInFlight--,this._drainPeriodEnergyQueue()})}}_commitPeriodEnergy(e,t){this._periodEnergyAt.set(e,Date.now()),this._periodEnergyPending.set(e,t),null==this._periodEnergyCommitTimer&&(this._periodEnergyCommitTimer=window.setTimeout(()=>{if(this._periodEnergyCommitTimer=null,!this._periodEnergyPending.size)return;const e=new Map(this._periodEnergy);for(const[t,i]of this._periodEnergyPending)e.set(t,i);this._periodEnergyPending.clear(),this._periodEnergy=e},120))}async _fetchPeriodEnergy(e){if(this._periodEnergyFetching.has(e))return;const t=e.lastIndexOf("|"),i=e.slice(0,t),s=e.slice(t+1);if(Date.now()-(this._periodEnergyAt.get(e)??0)<Bs.PERIOD_ENERGY_TTL&&this._periodEnergy.has(e))return;const o=Date.now()-(this._periodEnergyErrAt.get(e)??0);if(this._periodEnergyErrAt.has(e)&&o<Bs.PERIOD_ENERGY_RETRY)return;const a=this._periodStart(s);if(a){this._periodEnergyFetching.add(e);try{const t=await this.hass.callWS({type:"recorder/statistics_during_period",start_time:a.start.toISOString(),statistic_ids:[i],period:a.stat,types:["change"]}),s=(t?.[i]??[]).reduce((e,t)=>e+(t.change??0),0);this._periodEnergyErrAt.delete(e)&&(this._periodEnergyErrAt=new Map(this._periodEnergyErrAt)),this._commitPeriodEnergy(e,s)}catch{const t=new Map(this._periodEnergyErrAt);t.set(e,Date.now()),this._periodEnergyErrAt=t}finally{this._periodEnergyFetching.delete(e)}}}_capGraphMap(e,t){for(;e.size>this._graphDataCap;){let i=null,s=1/0;for(const o of e.keys()){if(o===t||this._graphFetching.has(o))continue;const e=this._graphFetchedAt.get(o)??0;e<s&&(s=e,i=o)}if(!i)break;e.delete(i),this._graphFetchedAt.delete(i)}}_commitGraphPoints(e,t){const i=this._graphCommitPending??new Map(this._graphData);i.set(e,t),this._capGraphMap(i,e),this._graphCommitPending=i,null==this._graphCommitTimer&&(this._graphCommitTimer=window.setTimeout(()=>{this._graphCommitTimer=null;const e=this._graphCommitPending;this._graphCommitPending=null,e&&(this._graphData=e)},this._graphCommitWindowMs))}async _fetchGraphData(e){this._graphFetching.add(e);const[t,i]=e.split("::"),s=parseInt(i,10)||24;try{let i=s>=24?await this._fetchStatistics(t,s):null;!i&&s>48&&(i=await this._fetchStatistics(t,s,"5minute")),i||(i=await this._fetchRawHistory(t,s)),i=function(e,t=240){if(e.length<=2*t)return e;const i=e[0].t,s=e[e.length-1].t-i||1,o=[];let a=0,n=e[0],r=e[0];const l=()=>{n===r?o.push(n):n.t<=r.t?o.push(n,r):o.push(r,n)};for(const o of e){const e=Math.min(t-1,Math.floor((o.t-i)/s*t));e!==a?(l(),a=e,n=o,r=o):(o.v<n.v&&(n=o),o.v>r.v&&(r=o))}return l(),o}(i),this._commitGraphPoints(e,i)}catch(i){console.warn("[ha-device-dashboard] history fetch failed",t,i),this._commitGraphPoints(e,[])}finally{this._graphFetchedAt.set(e,Date.now()),this._graphFetching.delete(e)}}_renderSparklines(e,t=!1,i){const s=t?this._graphSensorEntities(e):this._getGraphEntities(e);return this._renderSparklinesFiltered(e,s,t,i)}_renderSparklinesFiltered(e,t,i=!1,s){if(!t.length)return q``;const o=this._config.graph_style??{},a=200,n=i?120:o.height??32,r=i||null!=o.height,l=o.line_width??1.5,c=!1!==o.show_dots,d=!1!==o.tick_lines,p=!1!==o.time_labels,h=o.type??"line",u=o.bar_radius??1.5,g="area"===h,v=s??this._config.graph_hours??24,f=v<=1?6e4:v<=5?12e4:3e5,m=this._config.graph_sensor_colors??{},b=this._config.graph_style?.gauge_gradients??{},y=this._config.graph_line_color,x=e=>new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),w=t.map(e=>{const t=this._seriesWithLive(e.entityId,v);return this._requestGraphData(e.entityId,v),{e:e,points:t}}),_=Oe(w,e=>e.e.entityId,({e:t,points:s})=>{const{entityId:o,label:w,unit:_,dc:k}=t,A=b[k],S=m[k]??(Array.isArray(A)&&A.length>=2?Vt(A,.5):void 0)??y??wi.find(e=>e.key===k)?.defaultColor??"#f4601e";if(!s)return q`
          <div class="spark-row">
            <span class="spark-lbl">${w}</span>
            <div class="sparkline-loading" style="height:${r?n:32}px"></div>
            <span class="spark-val">—</span>
          </div>`;if(s.length<2)return q`
          <div class="spark-row">
            <span class="spark-lbl">${w}</span>
            <span class="spark-no-data" title="The recorder has nothing to plot for this sensor yet. A sensor added in the last few minutes fills in on its own.">no history yet</span>
            <button class="spark-retry" @click=${e=>{e.stopPropagation(),this._retryGraphData(o,v)}}>↺</button>
          </div>`;const C=s.map(e=>e.v),$=s.filter(e=>!e.live).map(e=>e.v),E=(this._config.graph_style?.sensor_ranges??{})[k]??{},T=E.min??Math.min(...$),I=E.max??Math.max(...$),M=I-T||1,D=s[0].t,O=s[s.length-1].t,z=O-D||1,P=e=>(e.t-D)/z*a,R=e=>n-4-(e.v-T)/M*(n-8),B=s.map(e=>`${P(e).toFixed(1)},${R(e).toFixed(1)}`).join(" "),L=P(s[0]).toFixed(1),F=`sg-${o.replace(/[^a-z0-9]/gi,"")}`,N=C[C.length-1],j=N%1==0?`${N}`:N.toFixed(1),H=Math.max(...$),U=Math.min(...$);let W=C.indexOf(H),V=C.indexOf(U);W<0&&(W=0),V<0&&(V=0);const K=P(s[W]).toFixed(1),X=R(s[W]).toFixed(1),Q=P(s[V]).toFixed(1),Z=R(s[V]).toFixed(1),J=x(s[0].t),ee=x((s[0].t+O)/2),te=f/z*a,ie=`${Math.max(.3,.7*te).toFixed(2)} ${Math.max(.3,.3*te).toFixed(2)}`,se=c&&I-T>0;return q`
        <div class="spark-group">
          <div class="spark-row ${i?"":"spark-row-clickable"}" @click=${i?Y:t=>{t.stopPropagation(),this._detailDevice=e.device_id}}>
            <span class="spark-lbl">${w}</span>
            <div class="spark-svg-wrap">
              <svg viewBox="0 0 ${a} ${n}" preserveAspectRatio="none"
                class="sparkline-svg"
                style="height:${r?n:32}px"
                @mousemove=${e=>{const t=e.currentTarget,i=t.getBoundingClientRect(),o=Math.max(0,Math.min(1,(e.clientX-i.left)/i.width)),n=D+o*z;let r=s[0];for(const e of s)Math.abs(e.t-n)<Math.abs(r.t-n)&&(r=e);const l=P(r),c=R(r),d=t.querySelector(".spark-crosshair");d&&(d.setAttribute("x1",String(l)),d.setAttribute("x2",String(l)),d.style.display="");const p=t.querySelector(".spark-hover-dot");p&&(p.setAttribute("cx",String(l)),p.setAttribute("cy",String(c)),p.style.display="");const h=t.parentElement,u=h?.querySelector(".spark-tooltip");if(u){const e=u.querySelector(".spark-tooltip-val"),t=u.querySelector(".spark-tooltip-time");e&&(e.textContent=`${r.v%1==0?String(r.v):r.v.toFixed(1)} ${_}`),t&&(t.textContent=x(r.t)),u.style.left=`${(l/a*100).toFixed(1)}%`,u.style.display=""}}} @mouseleave=${e=>{const t=e.currentTarget;t.querySelector(".spark-crosshair")?.style&&(t.querySelector(".spark-crosshair").style.display="none"),t.querySelector(".spark-hover-dot")?.style&&(t.querySelector(".spark-hover-dot").style.display="none");const i=t.parentElement?.querySelector(".spark-tooltip");i&&(i.style.display="none")}}>
                <defs>
                  <linearGradient id="${F}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${S}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${S}" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                ${d?G`
                  <line x1="0"        x2="0"        y1="0" y2="${n}" class="spark-tick"/>
                  <line x1="${100}" x2="${100}" y1="0" y2="${n}" class="spark-tick"/>
                  <line x1="${a}"     x2="${a}"     y1="0" y2="${n}" class="spark-tick"/>
                `:Y}
                ${"bar"!==h&&g?G`
                  <polygon points="${B} ${a},${n-4} ${L},${n-4}" fill="url(#${F})"/>
                `:Y}
                ${"bar"===h?s.map(e=>{const t=Math.max(2,a/s.length-2),i=P(e)-t/2,o=R(e),r=n-4-o;return G`<rect x="${i.toFixed(1)}" y="${o.toFixed(1)}" width="${t.toFixed(1)}" height="${Math.max(0,r).toFixed(1)}" rx="${u}" fill="${S}" opacity="0.75"/>`}):G`
                    <polyline points="${B}" fill="none"
                      stroke="${S}" stroke-width="${l}"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  `}
                <line x1="0" y1="${n}" x2="${a}" y2="${n}"
                  stroke="rgba(255,255,255,0.5)" stroke-width="0.8"
                  stroke-dasharray="${ie}" pointer-events="none"
                  vector-effect="non-scaling-stroke"/>
                ${se?G`
                  <circle cx="${K}" cy="${X}" r="3"
                    fill="${S}" stroke="#1e1e2e" stroke-width="1.2"/>
                  <circle cx="${Q}" cy="${Z}" r="2.5"
                    fill="#6b7280" stroke="#1e1e2e" stroke-width="1.2"/>
                `:Y}
                <line class="spark-crosshair" x1="0" x2="0" y1="0" y2="${n}" style="display:none"/>
                <circle class="spark-hover-dot" cx="0" cy="0" r="3.5" style="display:none"/>
              </svg>
              <div class="spark-tooltip" style="display:none">
                <span class="spark-tooltip-val"></span>
                <span class="spark-tooltip-time"></span>
              </div>
            </div>
            <span class="spark-val">${j} ${_}</span>
          </div>
          ${p?q`
            <div class="spark-time-row">
              <div class="spark-time-spacer"></div>
              <div class="spark-time-labels">
                <span>${J}</span><span>${ee}</span><span>now</span>
              </div>
              <div class="spark-time-end"></div>
            </div>
          `:Y}
        </div>`});return q`
      <div class="sparklines-block ${i?"exp":""}">
        ${_}
      </div>`}_closeDetailSheet(){this._detailDevice=null}_blockLayout(e,t){return function(e){return ji(e)?.tile_layout??Hi(e)?.tile_layout??Ui(e)?.tile_layout??e.view?.tile_layout??Yi(e)?.tile_layout??e.config.style_presets?.default?.tile_layout??e.config.tile_layout??Bt[e.profile]??Bt.generic}(this._cascade(e,t))}_trvColor(e){const t=Math.max(0,Math.min(1,e));let i,s,o;if(t<.5){const e=2*t;i=Math.round(74+156*e),s=Math.round(144+-18*e),o=Math.round(217+-183*e)}else{const e=2*(t-.5);i=Math.round(230+-1*e),s=Math.round(126+-69*e),o=Math.round(34+19*e)}return`rgb(${i},${s},${o})`}_renderTrvDial(e){const{minTemp:t,maxTemp:i,targetTemp:s,currentTemp:o,step:a,entityId:n}=e,r=this._trvDragTemp??s??t,l=i-t||1,c=Math.max(0,Math.min(1,(r-t)/l)),d=e=>210+(e-t)/l*300,p=(e,t)=>[80+t*Math.cos((e-90)*Math.PI/180),70+t*Math.sin((e-90)*Math.PI/180)],h=(e,t,i)=>{const[s,o]=p(e,i),[a,n]=p(t,i);return`M ${s} ${o} A ${i} ${i} 0 ${t-e>180?1:0} 1 ${a} ${n}`},u=this._trvColor(c),g=d(r),[v,f]=p(g,54),m=null!=o?(o-t)/(i-t):null,b=null!=o?p(d(o),54):null,y=null!=m?this._trvColor(m):u,x=`trv-grad-${n.replace(/\W/g,"_")}`;return G`
      <svg viewBox="0 0 160 132" class="trv-dial-svg valve-interactive" @pointerdown=${e=>{e.stopPropagation();const s=e.currentTarget;s.setPointerCapture(e.pointerId);const o=e=>{const o=this._trvTempFromEvent(e,s,t,i,a);null!=o&&(this._trvDragTemp=o)},r=()=>{s.removeEventListener("pointermove",o),s.removeEventListener("pointerup",l),s.removeEventListener("pointercancel",c)},l=e=>{const o=this._trvTempFromEvent(e,s,t,i,a)??this._trvDragTemp;this._trvDragTemp=null,null!=o&&this._setTemp(n,o),r()},c=()=>{this._trvDragTemp=null,r()};s.addEventListener("pointermove",o),s.addEventListener("pointerup",l),s.addEventListener("pointercancel",c)}}>
        <defs>
          <linearGradient id="${x}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${this._trvColor(0)}"/>
            <stop offset="50%"  stop-color="${this._trvColor(.5)}"/>
            <stop offset="100%" stop-color="${this._trvColor(1)}"/>
          </linearGradient>
        </defs>
        <path d="${h(210,510,54)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>
        <path d="${h(210,510,54)}" fill="none" stroke="url(#${x})" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${g>210?G`<path d="${h(210,g,54)}" fill="none" stroke="url(#${x})" stroke-width="8" stroke-linecap="round"/>`:Y}
        ${b?G`<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="white" stroke="${y}" stroke-width="2"/>`:Y}
        <circle cx="${v}" cy="${f}" r="9" fill="${u}" stroke="white" stroke-width="2" style="cursor:grab"/>
        <text x="${80}" y="${60}" text-anchor="middle" class="dial-target-text">${r.toFixed(1)}°</text>
        <text x="${80}" y="${75}" text-anchor="middle" class="dial-sub-text">target</text>
        <text x="${80}" y="${88}" text-anchor="middle" class="dial-current-text">${null!=o?`now ${o}°`:""}</text>
        <text x="18" y="128" text-anchor="middle" class="dial-range-text">${t}°</text>
        <text x="142" y="128" text-anchor="middle" class="dial-range-text">${i}°</text>
      </svg>
    `}_trvTempFromEvent(e,t,i,s,o){const a=t.getBoundingClientRect();if(!a.width||!a.height)return null;const n=(e.clientX-a.left)*(160/a.width),r=(e.clientY-a.top)*(132/a.height);let l=Math.atan2(r-70,n-80)*(180/Math.PI)+90;l<0&&(l+=360);const c=(l-210+360)%360;if(c>300)return null;const d=i+c/300*(s-i),p=o||.5;return Math.max(i,Math.min(s,Math.round(d/p)*p))}_valvePosFromEvent(e,t){const i=t.getBoundingClientRect();if(!i.width||!i.height)return null;const s=(e.clientX-i.left)*(160/i.width),o=(e.clientY-i.top)*(128/i.height);let a=Math.atan2(o-68,s-80)*(180/Math.PI)+90;a<0&&(a+=360);const n=(a-210+360)%360;return n>300?null:Math.round(n/300*100)}_renderValveDial(e){const t=e.position??("open"===e.state?100:0),i=(e,t)=>[80+t*Math.cos((e-90)*Math.PI/180),68+t*Math.sin((e-90)*Math.PI/180)],s=(e,t,s)=>{const[o,a]=i(e,s),[n,r]=i(t,s);return`M ${o} ${a} A ${s} ${s} 0 ${t-e>180?1:0} 1 ${n} ${r}`},o=e.supportsPosition||!!e.numEntityId,a=this._valveDragPos??t,n=(e=>210+e/100*300)(a),[r,l]=i(n,54),c=`hsl(${200+.2*a}, ${40+.55*a}%, ${38+.18*a}%)`,d=null!=this._valveDragPos?`${Math.round(this._valveDragPos)}%`:"opening"===e.state?it("state.opening"):"closing"===e.state?it("state.closing"):it(100===t?"state.open":0===t?"state.closed":"state.partial"),p=o?t=>{t.stopPropagation();const i=t.currentTarget;i.setPointerCapture(t.pointerId);const s=e=>{const t=this._valvePosFromEvent(e,i);null!=t&&(this._valveDragPos=t)},o=()=>{i.removeEventListener("pointermove",s),i.removeEventListener("pointerup",a),i.removeEventListener("pointercancel",n)},a=t=>{const s=this._valvePosFromEvent(t,i)??this._valveDragPos;this._valveDragPos=null,null!=s&&this._setValvePosition(e.entityId,s,e.numEntityId),o()},n=()=>{this._valveDragPos=null,o()};i.addEventListener("pointermove",s),i.addEventListener("pointerup",a),i.addEventListener("pointercancel",n)}:void 0;return G`
      <svg viewBox="0 0 160 128" class="trv-dial-svg ${o?"valve-interactive":""}"
        @pointerdown=${p}>
        <defs>
          <linearGradient id="valve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6b7280"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        ${o?G`<path d="${s(210,510,54)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>`:Y}
        <path d="${s(210,510,54)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${t>0?G`<path d="${s(210,n,54)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round"/>`:Y}
        <circle cx="${r}" cy="${l}" r="9" fill="${c}" stroke="white" stroke-width="2" style="${o?"cursor:grab":""}"/>
        <text x="${80}" y="${60}" text-anchor="middle" class="dial-target-text">${Math.round(a)}%</text>
        <text x="${80}" y="${75}" text-anchor="middle" class="dial-sub-text">${d}</text>
        <text x="16" y="124" text-anchor="middle" class="dial-range-text">${it("state.closed")}</text>
        <text x="144" y="124" text-anchor="middle" class="dial-range-text">${it("state.open")}</text>
      </svg>
    `}_getVirtualControls(e){return e.entities.filter(e=>!("select"!==e.domain||!/_enum_\d+$/i.test(e.entity_id))||(!("number"!==e.domain||!/_number_\d+$/i.test(e.entity_id))||(!("button"!==e.domain||!/_button_\d+$/i.test(e.entity_id))||(!("text"!==e.domain||!/_text_\d+$/i.test(e.entity_id))||!("switch"!==e.domain||!/_boolean_\d+$/i.test(e.entity_id)))))).map(e=>{const t=this.hass.states[e.entity_id],i=t?.attributes??{};return{entityId:e.entity_id,domain:e.domain,label:i.friendly_name??e.entity_id.split(".").pop().replace(/_/g," "),value:t?.state??"unavailable",options:i.options,min:i.min,max:i.max,step:i.step,isOn:"on"===t?.state}})}_renderEntityAnim(e,t,i){const s=this._config.device_styles?.[i]?.entity_animations?.[e];if(!s)return q``;const o=(t?s.on:s.off)??"none";return"none"===o?q``:vt(o,t,`--ent-spd:${s.speed??1};--ent-size:${s.size??1}`,"ent-icon")}_renderBlock(e,t,i,s){return Ds(s??this._buildTileCtx(t,i,this._tileAccent(t,t.area??"")),e)}_renderPowerBar(e){if(!this._config.show_power_bar)return q``;const t=this._getPower(e)??0,i=this._config.power_bar_max??2e3;return q`
      <div class="power-bar" title="${t.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${Math.min(100,t/i*100)}%"></div>
      </div>`}_tileSensors(e){const t=jt(e,this.hass.states),i=e=>t[e]?.value??null,s=i("power"),o=i("voltage"),a=i("current"),n=i("temperature");let r=null,l=null,c=null;for(const t of e.entities){if("sensor"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes.device_class??"",s=parseFloat(e.state);"energy"===i&&null==r&&(r=isNaN(s)?null:s);const o=t.entity_id;(o.includes("rssi")||o.includes("signal"))&&(l=isNaN(s)?null:s),o.includes("uptime")&&(c=isNaN(s)?null:s)}let d=it("energy.total");const p=this._config.device_styles?.[e.device_id]?.energy_entity;if(p){const e=this.hass.states[p],t=e&&"unavailable"!==e.state&&"unknown"!==e.state?parseFloat(e.state):NaN;r=isNaN(t)?null:t}const h=this._energyPeriod(e);if("total"!==h){const t=p??this._energyEntitiesFor(e)[0];if(t){const e=this._periodEnergyValue(t,h);e.failed||(r=e.kwh,d=this._energyPeriodLabel(h))}}return{power:s,voltage:o,current:a,temp:n,energy:r,energyLabel:d,rssi:l,uptime:c}}_deviceAlertLabels(e){const t=this.hass.states;return[...as(e,t),...ns(e,t)]}_lightOpts(){return{labels:this._config.light_labels,entities:this._config.light_entities}}_deviceMetric(e,t){if("power"===t)return this._getPower(e);if("energy"===t)return this._deviceEnergy(e).value;const i={temperature:"temperature",humidity:"humidity",illuminance:"illuminance"};for(const s of e.entities){if("sensor"!==s.domain)continue;const e=this.hass.states[s.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const o=parseFloat(e.state);if(isNaN(o))continue;const a=e.attributes.device_class??"";if("rssi"===t){if("signal_strength"===a||s.entity_id.includes("rssi"))return o}else if(a===i[t])return o}return null}_deviceEnergy(e){const t=this._energyEntitiesFor(e);if(!t.length)return{value:null,period:"total"};const i=this._energyPeriod(e);if("total"===i)return{value:this._deviceEnergyLifetime(e),period:"total"};let s=0,o=!1;for(const a of t){const t=this._periodEnergyValue(a,i);if(t.failed)return{value:this._deviceEnergyLifetime(e),period:"total"};null!=t.kwh&&(s+=t.kwh,o=!0)}return o?{value:s,period:i}:{value:null,period:i}}_deviceEnergyLifetime(e){let t=0,i=!1;for(const s of this._energyEntitiesFor(e)){const e=this.hass.states[s];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const o=parseFloat(e.state);isNaN(o)||(t+=o,i=!0)}return i?t:null}_headerEnergyAgg(e){const t=e.map(e=>({d:e,e:this._deviceEnergy(e)})).filter(e=>null!=e.e.value);if(!t.length)return null;const i=new Set(t.map(e=>e.e.period));if(1===i.size){const e=[...i][0];return{value:t.reduce((e,t)=>e+t.e.value,0),label:this._energyPeriodLabel(e)}}let s=0,o=!1;for(const{d:e}of t){const t=this._deviceEnergyLifetime(e);null!=t&&(s+=t,o=!0)}return o?{value:s,label:it("energy.total")}:null}_formatHeaderMetric(e,t){switch(e){case"power":return ni(t);case"energy":return ri(t);case"temperature":return di(t);case"humidity":return fi(t);case"illuminance":return mi(t);case"rssi":return`${Math.round(t)} dBm`;default:return String(t)}}_devicesWithUpdates(e){return e.filter(e=>ls(e,this.hass.states,{includeBeta:this._config.include_beta_updates})).map(e=>({device:e,fw:this._getFirmware(e)})).filter(e=>!!e.fw)}_headerMetricAggs(e,t){const i={temperature:"temperature",humidity:"humidity",illuminance:"illuminance"},s=t.filter(e=>i[e]),o=t.includes("power"),a=t.includes("rssi"),n=new Map,r=(e,t)=>{const i=n.get(e)??{sum:0,count:0};i.sum+=t,i.count++,n.set(e,i)};for(const t of e){if(o){const e=this._getPower(ss(t));null!=e&&r("power",e)}if(!s.length&&!a)continue;const e=new Set;for(const o of t.entities){if("sensor"!==o.domain||!is(o))continue;const t=this.hass.states[o.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const n=parseFloat(t.state);if(isNaN(n))continue;const l=t.attributes.device_class??"";!a||e.has("rssi")||"signal_strength"!==l&&!o.entity_id.includes("rssi")||(e.add("rssi"),r("rssi",n));for(const t of s)e.has(t)||l!==i[t]||(e.add(t),r(t,n))}}return n}_renderHeaderChips(e){const t=this._config.header_chips??$i,i=e.filter(e=>this._isOnline(e)).length,s=this._headerMetricAggs(e,t),o=e=>t=>{t.stopPropagation(),this._cloudDetailOpen=this._cloudDetailOpen===`m:${e}`?null:`m:${e}`};return q`
      <div class="dash-stats">
        ${t.map(t=>{const a=Ci.find(e=>e.key===t);if(!a)return Y;let n="",r="metric";if("online"===t)n=`${i}/${e.length} online`,r="online";else if("offline"===t){const t=e.length-i;if(!t)return Y;n=`${t} offline`,r="offline-count"}else if("alerts"===t){const t=e.filter(e=>this._deviceAlertLabels(e).length>0).length;if(!t)return Y;n=`⚠ ${t}`,r="alerts-count"}else if("updates"===t){const t=this._devicesWithUpdates(e).length;if(!t)return Y;n=`⬆ ${t} update${t>1?"s":""}`,r="updates-count"}else if("lights"===t){const{on:t,total:i}=hs(e,this.hass.states,this._lightOpts());if(!i)return Y;n=`${t}/${i} lights on`,r=t?"lights-on":"metric"}else if("energy"===t){const t=this._headerEnergyAgg(e);if(!t)return Y;n=`${t.label} ${this._formatHeaderMetric("energy",t.value)}`}else{const e=s.get(t);if(!e||!e.count)return Y;const i="sum"===a.agg?e.sum:e.sum/e.count;n="power"===t?this._formatHeaderMetric(t,i):`${a.label} ${this._formatHeaderMetric(t,i)}`,"power"===t&&(r="power")}const l=this._cloudDetailOpen===`m:${t}`;return q`<span class="stat ${r} ${l?"active":""}" @click=${o(t)}>${n}</span>`})}
      </div>`}_renderHeaderDetail(e){const t=this._cloudDetailOpen;if(!t?.startsWith("m:"))return q``;const i=t.slice(2),s=Ci.find(e=>e.key===i);if(!s)return q``;let o=[],a="cloud-on";if("online"===i?o=e.filter(e=>this._isOnline(e)).map(e=>({name:e.name,value:""})):"offline"===i?(o=e.filter(e=>!this._isOnline(e)).map(e=>({name:e.name,value:""})),a="cloud-off"):"alerts"===i?(o=e.map(e=>({d:e,a:this._deviceAlertLabels(e)})).filter(e=>e.a.length).sort((e,t)=>t.a.length-e.a.length).map(e=>({name:e.d.name,value:e.a.join(", ")})),a="cloud-off"):o="updates"===i?this._devicesWithUpdates(e).map(e=>({name:e.device.name,value:`${e.fw.current} → ${e.fw.newVersion}`})):"lights"===i?hs(e,this.hass.states,this._lightOpts()).onNames.map(e=>({name:e,value:"on"})):e.map(e=>({d:e,v:this._deviceMetric(e,i)})).filter(e=>null!=e.v).sort((e,t)=>t.v-e.v).map(e=>({name:e.d.name,value:this._formatHeaderMetric(i,e.v)})),!o.length)return q``;const n="energy"===i?this._headerEnergyAgg(e)?.label??s.label:s.label;return q`
      <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
        <div class="cloud-detail-hdr ${a}">● ${n} — ${o.length} device${o.length>1?"s":""}</div>
        <div class="metric-list">
          ${o.map(e=>q`
            <div class="metric-row">
              <span class="metric-name">${e.name}</span>
              ${e.value?q`<span class="metric-val">${e.value}</span>`:Y}
            </div>`)}
        </div>
      </div>`}_tileAccent(e,t){const i=this._config.device_styles?.[e.device_id]?.color;if(i)return i;const s=this._profileStyle(e)?.color;if(s)return s;const o=this._config.area_styles?.[t];return o?.accentColor?o.accentColor:this._styleTokens().accent_color??"var(--sc-accent)"}_renderTileLowerBody(e,t,i={}){const s=this._getPrimarySwitch(e),o=this._getTrv(e),a=this._getValve(e),n=this._getCover(e),r=s?.isOn??!1;let l=null;const c=()=>l??(l=this._buildTileCtx(e,t,this._tileAccent(e,e.area??""))),d=this._getGraphEntities(e),p=i.skipGraphs?[]:i.skipPowerGraph?d.filter(e=>"power"!==e.dc):d,h=p.length?q`<div class="ts-lower-section ts-lower-graphs">
          ${this._renderSparklinesFiltered(e,p)}
        </div>`:Y,u=void 0!==s?.brightness,g=!!s?.colorModes?.length,v=g&&s.rgbColor?this._rgbToHex(...s.rgbColor):"#ffffff",f=g&&(s.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),m=u&&r?Math.max(1,s.brightness??1):0,b=s?.whiteValue??0,y=s?this.hass.states[s.entityId]:null,x=y?.attributes?.effect_list??[],w=y?.attributes?.effect??null,_=u?q`
      <div class="ts-lower-section ts-lower-dimmer" @click=${e=>e.stopPropagation()}>
        <div class="tile-dim-row">
          ${g?q`
            <input type="color" class="color-swatch tile-color-swatch" .value=${v}
              ?disabled=${!r}
              @change=${e=>{e.stopPropagation(),this._setColor(s.entityId,e.target.value,b,f)}}/>
          `:Y}
          <input type="range" class="dim-slider" min="1" max="100"
            .value=${String(r?m:1)}
            ?disabled=${!r}
            @input=${e=>{const t=e.target.closest(".tile-dim-row")?.querySelector(".dim-pct");t&&(t.textContent=`${e.target.value}%`)}}
            @change=${e=>{this._setBrightness(s.entityId,parseInt(e.target.value,10))}}/>
          <span class="dim-pct">${m}%</span>
        </div>
        ${f?q`
          <div class="tile-dim-row tile-white-row">
            <span class="dim-white-lbl">W</span>
            <input type="range" class="dim-slider white-slider" min="0" max="255"
              .value=${String(b)}
              @input=${e=>{const t=e.target.closest(".tile-white-row")?.querySelector(".white-pct");t&&(t.textContent=e.target.value)}}
              @change=${e=>{this._setColor(s.entityId,v,parseInt(e.target.value,10),!0)}}/>
            <span class="white-pct dim-pct">${b}</span>
          </div>
        `:Y}
        ${ht(x,w,e=>this.hass.callService("light","turn_on",{entity_id:s.entityId,effect:e}))}
      </div>
    `:Y,k=o?q`
      <div class="ts-lower-section ts-lower-trv" @click=${e=>e.stopPropagation()}>
        ${this._renderBlock("trv_control",e,t,c())}
      </div>
    `:Y,A=a?q`
      <div class="ts-lower-section ts-lower-valve" @click=${e=>e.stopPropagation()}>
        ${this._renderBlock("valve_controls",e,t,c())}
      </div>
    `:Y,S=n?q`
      <div class="ts-lower-section ts-lower-cover" @click=${e=>e.stopPropagation()}>
        ${this._renderBlock("cover_controls",e,t,c())}
      </div>
    `:Y,C=e.entities.filter(e=>"switch"===e.domain&&/_(switch|relay|channel)_\d/.test(e.entity_id)),$=C.length>1?q`
      <div class="ts-lower-section ts-lower-relay" @click=${e=>e.stopPropagation()}>
        ${this._renderBlock("relay_channels",e,t,c())}
      </div>
    `:Y;return p.length||u||o||a||n||C.length>1?q`
      <div class="ts-lower-body">
        ${h}
        ${_}
        ${k}
        ${A}
        ${S}
        ${$}
      </div>`:q``}_ensureGraphData(e){const t=e.entities.find(e=>{if("sensor"!==e.domain)return!1;const t=this.hass.states[e.entity_id];return t&&"power"===t.attributes?.device_class});t&&this._requestGraphData(t.entity_id)}_getPowerSparks(e){const t=e.entities.find(e=>{if("sensor"!==e.domain)return!1;const t=this.hass.states[e.entity_id];return t&&"power"===t.attributes?.device_class});return t?this._seriesWithLive(t.entity_id,this._config.graph_hours??24)??[]:[]}_resolveStyle(e,t){return Vi(e)}_profileStyle(e){return this._config.profile_styles?.[this._profile(e).type]}_cascade(e,t){return{config:this._config,device:e,profile:(t??this._profile(e)).type,view:this._getActiveView()??void 0}}_resolveCustomStyle(e){return Gi(this._config,e)}_handleScenePress(e){const t=new Set(["restart","identify","update"]),i=e.entities.filter(e=>"button"===e.domain&&!e.entity_category&&!t.has(String(this.hass.states[e.entity_id]?.attributes?.device_class??""))&&!/_(reboot|restart|identify)$/.test(e.entity_id));if(!i.length)return this._detailDevice=e.device_id,void(this._detailHistoryRange=24);for(const e of i)this.hass.callService("button","press",{entity_id:e.entity_id});const s=this.renderRoot?.querySelector(`.ts-scene[data-dev="${e.device_id}"] .ts-scene-ripple`);s&&(s.classList.add("active"),setTimeout(()=>s.classList.remove("active"),600))}_adjustTrvTemp(e,t){const i=this._trvDragTemp??e.targetTemp;if(null==i)return;const s=i+t*e.step,o=t>0?Math.min(e.maxTemp,Math.round(100*s)/100):Math.max(e.minTemp,Math.round(100*s)/100);this._trvDragTemp=o,this._trvBtnTimer&&clearTimeout(this._trvBtnTimer),this._trvBtnTimer=setTimeout(()=>{this._setTemp(e.entityId,this._trvDragTemp??o),this._trvDragTemp=null},600)}_buildTileCtx(e,t,i){const s=e=>{const t=new Map;return i=>{if(t.has(i.device_id))return t.get(i.device_id);const s=e(i);return t.set(i.device_id,s),s}},o=s(e=>this._getPrimarySwitch(e)),a=this._isOnline(e),n=o(e),r=n?.isOn??!1,l=this._cascade(e,t);return{showEl:e=>Xi(l,e),hass:this.hass,config:this._config,device:e,profile:t,accent:i,online:a,isOn:r,getPrimarySwitch:o,getTrv:s(e=>this._getTrv(e)),getCover:s(e=>this._getCover(e)),getValve:s(e=>this._getValve(e)),getPower:s(e=>this._getPower(e)),tileSensors:s(e=>this._tileSensors(e)),sensorValues:s(e=>jt(e,this.hass.states)),sensorSelection:s(e=>this._sensorSelection(e)),getGraphEntities:s(e=>this._getGraphEntities(e)),getGraphSensors:s(e=>this._graphSensorEntities(e)),requestBrowse:e=>this._requestBrowse(e),getBrowseGroups:e=>this._getBrowseGroups(e),getPowerSparks:s(e=>this._getPowerSparks(e)),ensureGraphData:e=>this._ensureGraphData(e),renderEntityAnim:(e,t,i)=>this._renderEntityAnim(e,t,i),renderSparklinesFiltered:(e,t)=>this._renderSparklinesFiltered(e,t),renderTileLowerBody:(e,t,i)=>this._renderTileLowerBody(e,t,i),renderTrvDial:e=>this._renderTrvDial(e),renderValveDial:e=>this._renderValveDial(e),setTemp:(e,t)=>this._setTemp(e,t),setHvacMode:(e,t,i)=>this._setHvacMode(e,t,i),setPresetMode:(e,t)=>this._setPresetMode(e,t),coverAction:(e,t,i)=>this._coverAction(e,t,i),valveAction:(e,t,i)=>this._valveAction(e,t,i),toggle:(t,i,s)=>this._toggle(t,i,s,e),pressButton:(e,t)=>this._pressButton(e,t),setNumberValue:(e,t)=>this._setNumberValue(e,t),selectOption:(e,t)=>this._selectOption(e,t),timeAgo:e=>this._timeAgo(e),getInputChannels:s(e=>this._getInputChannels(e)),getInputActionLabel:(e,t)=>{const i=this._inputAction(e,t);return i?this._inputActionLabel(i,e,t):null},getInputDimFeedback:e=>{const t=this._dimFeedback;return t&&t.key===e.entityId?{dir:t.dir,pct:t.pct}:null},inputHasHold:(e,t)=>{const i=this._inputAction(e,t)?.hold_action;return!!i&&"none"!==i.action},getInputActionState:(e,t)=>this._inputActionState(e,t),getInputSelectChip:(e,t)=>this._inputSelectChip(e,t),setInputSelectOption:(e,t)=>this.hass.callService("select","select_option",{entity_id:e,option:t}),runInputAction:(e,t,i)=>this._runInputAction(e,t,i),startInputHold:(e,t,i)=>this._startInputHold(e,t,i),endInputHold:()=>this._endInputHold(),handleScenePress:e=>this._handleScenePress(e),setCoverPosition:(e,t)=>{this._setCoverPosition(e,t)},installUpdate:(e,t)=>{this._installUpdate(e,t)},adjustTrvTemp:(e,t)=>this._adjustTrvTemp(e,t),requestGraphData:(e,t)=>this._requestGraphData(e,t),getGraphPoints:(e,t)=>this._seriesWithLive(e,t)??[],rgbToHex:(e,t,i)=>this._rgbToHex(e,t,i),setBrightness:(e,t)=>this._setBrightness(e,t),setColor:(e,t,i,s)=>this._setColor(e,t,i,s),getAlerts:s(e=>this._getAlerts(e)),getFirmware:s(e=>this._getFirmware(e)),getSensors:s(e=>this._getSensors(e)),getVirtualControls:s(e=>this._getVirtualControls(e)),renderSparklines:e=>this._renderSparklines(e),renderSparklinesExpanded:(e,t)=>this._renderSparklines(e,!0,t),renderPowerBar:e=>this._renderPowerBar(e),closeDetailSheet:()=>this._closeDetailSheet(),getDetailHistoryRange:()=>this._detailHistoryRange,setDetailHistoryRange:e=>{this._detailHistoryRange=e},fireMoreInfo:e=>{Re(this,"hass-more-info",{entityId:e})}}}_renderTile(e,t){const i=this._isOnline(e),s=this._profile(e),o=this._profileStyle(e),a=this._getActiveView(),n=(r=this._config,l=a??void 0,c=e.area?this._config.area_styles?.[e.area]:void 0,c?.tile_size??l?.tile_size??r.tile_size??"md");var r,l,c;const d=this._config.device_styles?.[e.device_id]?.color??o?.color,p={};this._applyTileTheme(p,this._cascade(e,s)),d&&(p.borderColor=d,p.boxShadow=`0 0 12px ${d}50`);const h=this._config.device_styles?.[e.device_id]?.bg_image;if(h){const t=this._config.device_styles?.[e.device_id]?.bg_image_size;p["--sc-tile-bg-image"]=`url("${h}")`,p["--sc-tile-bg-image-sz"]="stretch"===t?"100% 100%":t??"cover"}const u=this._config.device_styles?.[e.device_id],g=u?.tile_style??o?.tile_style??t??a?.tile_style??this._config.tile_style??(this._config.smart_tile_styles?zt(s.type,e):void 0),{base:v}=this._resolveCustomStyle(g),{style:f,variant:m}=this._resolveStyle(v,s),b=function(e,t){return ji(e)?.power_monitor_variant??Hi(e)?.power_monitor_variant??Ui(e)?.power_monitor_variant??e.view?.power_monitor_variant??e.config.power_monitor_variant??Yi(e)?.variant??e.config.style_presets?.["power-monitor"]?.variant??t}(this._cascade(e,s),m);if("default"===f||!f){const t=Rt(this._blockLayout(e,s)),o=this._tileAccent(e,e.area??""),a=this._buildTileCtx(e,s,o);return q`
        <div class="tile tile--clickable ${i?"":"offline"} tile-${n}" style=${ke(p)}
          @pointerdown=${t=>this._onTilePointerDown(e,t)}
          @pointerup=${t=>this._onTilePointerUp(e,t)}
          @pointercancel=${()=>this._onTilePointerCancel()}
          @pointermove=${e=>this._onTilePointerMove(e)}>
          ${Oe(t,e=>e.join("+"),e=>1===e.length?Ds(a,e[0]):q`<div class="tile-row">${e.map(e=>Ds(a,e))}</div>`)}
        </div>`}const y=e.area??"",x=this._tileAccent(e,y);return q`<div class="${`tile tile-${n} ${i?"":"offline"} tile--clickable`}" style=${ke(p)}
      @pointerdown=${t=>this._onTilePointerDown(e,t)}
      @pointerup=${t=>this._onTilePointerUp(e,t)}
      @pointercancel=${()=>this._onTilePointerCancel()}
      @pointermove=${e=>this._onTilePointerMove(e)}>
      ${"power-monitor"===f?Cs(this._buildTileCtx(e,s,x),b):"light-control"===f?Ms(this._buildTileCtx(e,s,x)):"climate-control"===f?function(e){const{device:t,accent:i,online:s,hass:o}=e,a=e.getTrv(t);if(!a)return nt(t,s,"ts-climate",it("empty.no_climate"));const n="heating"===a.hvacAction,r=t.entities.find(e=>"sensor"===e.domain&&"battery"===o.states[e.entity_id]?.attributes?.device_class),l=r&&parseFloat(o.states[r.entity_id]?.state??"")||null;return q`
    <div class="ts-climate" style="--ts-accent:${i}" @click=${e=>e.stopPropagation()}>
      <div class="ts-climate-top">
        ${at(t,s)}
        ${e.showEl("heating_badge")?q`<div style="display:flex;align-items:center;gap:6px">
          ${n?q`<span style="font-size:11px;padding:2px 7px;border-radius:10px;background:rgba(249,115,22,0.18);color:#f97316;font-weight:600">🔥 ${it("tile.heating")}</span>`:q`<span style="font-size:11px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,0.06);color:var(--sc-text-muted)">${it("tile.idle")}</span>`}
        </div>`:Y}
      </div>
      ${e.showEl("dial")?e.renderTrvDial(a):Y}
      ${e.showEl("adjust_buttons")?q`<div class="trv-dial-btns">
        <button class="trv-step" @click=${()=>e.adjustTrvTemp(a,-1)}>−</button>
        <span class="trv-flame">${n?"🔥":""}</span>
        <button class="trv-step" @click=${()=>e.adjustTrvTemp(a,1)}>+</button>
      </div>`:Y}
      ${e.showEl("stats")?q`<div class="trv-stat-row">
        <div class="trv-stat"><span class="trv-stat-lbl">${it("tile.now")}</span><span class="trv-stat-val">${null!=a.currentTemp?`${a.currentTemp}°`:"—"}</span></div>
        <div class="trv-stat"><span class="trv-stat-lbl">${it("tile.set")}</span><span class="trv-stat-val">${null!=a.targetTemp?`${a.targetTemp.toFixed(1)}°`:"—"}</span></div>
        ${null!=a.valvePosition?q`<div class="trv-stat"><span class="trv-stat-lbl">${it("tile.valve")}</span><span class="trv-stat-val">${Math.round(a.valvePosition)}%</span></div>`:Y}
        ${null!=l?q`<div class="trv-stat"><span class="trv-stat-lbl">${it("chip.battery_short")}</span><span class="trv-stat-val">${l}%</span></div>`:Y}
      </div>`:Y}
      ${e.showEl("presets")&&a.presetModes.length?q`<div class="trv-presets">${a.presetModes.map(t=>q`
        <button class="trv-preset-btn ${a.presetMode===t?"active":""}"
          @click=${()=>e.setPresetMode(a.entityId,t)}>${(ut[t]??"")+t}</button>`)}
      </div>`:Y}
      ${e.showEl("graphs")&&e.getGraphEntities(t).length?q`<div class="ts-lower-section ts-lower-graphs">${e.renderSparklines(t)}</div>`:Y}
    </div>`}(this._buildTileCtx(e,s,x)):"cover-control"===f?function(e){const{device:t,accent:i,online:s}=e,o=e.getCover(t);if(!o)return q`<div class="ts-cover"><span style="color:var(--sc-text-muted);font-size:.8em">${it("empty.no_cover")}</span></div>`;const a=o.position??("open"===o.state?100:0),n="opening"===o.state||"closing"===o.state,r=Math.ceil(a/100*gt.length);return q`
    <div class="ts-cover" style="--ts-accent:${i}" @click=${e=>e.stopPropagation()}>
      <div class="ts-cover-top">
        ${at(t,s)}
        ${e.showEl("position_pct")?q`<span class="ts-cover-pct" style="color:${i}">${Math.round(a)}%</span>`:Y}
      </div>
      ${e.showEl("shutter_graphic")?q`<div class="ts-cover-graphic">
        <svg viewBox="0 0 60 32" style="width:100%;height:40px">
          <rect x="1" y="1" width="58" height="1.5" rx="0.75" fill="currentColor" opacity=".6"/>
          <line x1="30" y1="2.5" x2="30" y2="31" stroke="currentColor" stroke-width="0.8" opacity=".3"/>
          ${gt.map((e,t)=>G`<rect x="3" y="${e}" width="54" height="3" rx="1" fill="${i}" opacity="${t<r?"0.85":"0.1"}"/>`)}
        </svg>
        ${n&&e.showEl("moving_label")?q`<span class="ts-cover-state">${"opening"===o.state?"▲ Opening…":"▼ Closing…"}</span>`:Y}
      </div>`:Y}
      ${e.showEl("buttons")?q`<div class="ts-cover-btns">
        <button class="ts-cover-btn" @click=${t=>e.coverAction(o.entityId,"open",t)}>▲</button>
        <button class="ts-cover-btn ts-cover-stop" @click=${t=>e.coverAction(o.entityId,"stop",t)}>■</button>
        <button class="ts-cover-btn" @click=${t=>e.coverAction(o.entityId,"close",t)}>▼</button>
      </div>`:Y}
      ${null!=o.position&&e.showEl("position_slider")?q`
        <input type="range" class="ts-cover-slider" min="0" max="100" .value=${String(Math.round(a))}
          title="Position" aria-label="Cover position"
          @pointerdown=${e=>e.stopPropagation()}
          @change=${t=>e.setCoverPosition(o.entityId,parseInt(t.target.value,10))}/>`:Y}
      ${e.showEl("graphs")&&e.getGraphEntities(t).length?q`<div class="ts-lower-section ts-lower-graphs">${e.renderSparklines(t)}</div>`:Y}
    </div>`}(this._buildTileCtx(e,s,x)):"sensor-card"===f?Ss(this._buildTileCtx(e,s,x)):"input-control"===f?yt(this._buildTileCtx(e,s,x)):"scene-button"===f?function(e){const{device:t,accent:i,online:s,config:o}=e,a=e.getInputChannels(t),n=o.device_styles?.[t.device_id],r=n?.tile_icon??"pulse",l=n?.tile_icon_size??1,c=vt(r,!0,`--ent-spd:${n?.tile_icon_speed??1};color:${i}`,"ts-scene-icon"),d=t.entities.reduce((t,i)=>{const s=e.hass.states[i.entity_id]?.last_changed??"";return s>t?s:t},""),p=d?e.timeAgo(d):"";return a.length>0?q`
      <div class="ts-scene" style="--ts-accent:${i}">
        <div class="ts-scene-top">
          ${at(t,s)}
        </div>
        ${e.showEl("input_rows")?q`<div class="tile-inputs">
          ${a.map(i=>rt(e,t,i))}
        </div>`:Y}
      </div>`:q`
    <div class="ts-scene ts-scene-centered" style="--ts-accent:${i}"
      @click=${i=>{i.stopPropagation(),e.handleScenePress(t)}}>
      ${e.showEl("icon")?q`<div class="ts-scene-icon-wrap" style="--ent-size:${l}">${c}</div>`:Y}
      ${e.showEl("name")?q`<div class="ts-scene-name">${t.name}</div>`:Y}
      ${p&&e.showEl("timestamp")?q`<div class="ts-scene-time">${p}</div>`:Y}
      <div class="ts-scene-ripple"></div>
    </div>`}(this._buildTileCtx(e,s,x)):Y}
    </div>`}_tileTapIsControl(e){const t=e.target;return!!t?.closest?.(Bs._TILE_CONTROL_SEL)}_onTilePointerDown(e,t){this._tileTapIsControl(t)||(this._lpStart={x:t.clientX,y:t.clientY})}_onTilePointerUp(e,t){if(this._tileTapIsControl(t))return;const i=this._lpStart;if(this._lpStart=null,i){if(this.preview||this.hasAttribute("data-edit-preview")){if(!window.dispatchEvent(new CustomEvent("hdd-editor-goto",{detail:{device:e.device_id},cancelable:!0})))return}this._detailDevice=e.device_id,this._detailHistoryRange=24}}_onTilePointerCancel(){this._lpStart=null}_onTilePointerMove(e){if(!this._lpStart)return;const t=e.clientX-this._lpStart.x,i=e.clientY-this._lpStart.y;t*t+i*i>100&&(this._lpStart=null)}_renderFavoritesSection(e){const t=this._config.favorites;if(!t?.length)return q``;const i=new Map(t.map((e,t)=>[e,t])),s=e.filter(e=>i.has(e.device_id)).sort((e,t)=>(i.get(e.device_id)??0)-(i.get(t.device_id)??0));if(!s.length)return q``;const o=s.reduce((e,t)=>e+(this._getPower(t)??0),0),a=s.filter(e=>this._isOnline(e)).length,n=Ji(this._config,this._getActiveView()??void 0),r=this._config.area_styles?.Favourites?.tile_style;return q`
      <div class="fav-section">
        <div class="fav-header">
          <span class="fav-star">★</span>
          <span class="fav-label">${it("header.favourites")}</span>
          <div class="fav-chips">
            <span class="fav-chip fav-chip-count">${a}/${s.length}</span>
            ${o>0?q`<span class="fav-chip fav-chip-power">${ni(o)}</span>`:Y}
          </div>
        </div>
        <div class="device-grid fav-grid" style="--cols:${n}">
          ${Oe(s,e=>e.device_id,e=>q`
            <div class="fav-tile-wrap">
              ${e.area?q`<span class="tile-room-badge">${e.area}</span>`:Y}
              ${this._renderTile(e,r)}
            </div>
          `)}
        </div>
      </div>`}_getAreaChips(e,t){const i=t?this._config.area_styles?.[t]?.header_chips:void 0,s=void 0!==i?new Set(i):void 0!==this._config.area_header_chips?new Set(this._config.area_header_chips):new Set(Ti),o=e=>s.has(e),a={},n=(e,t)=>{a[e]||(a[e]={sum:0,count:0}),a[e].sum+=t,a[e].count++};for(const t of e)for(const e of t.entities){if("sensor"!==e.domain||!is(e))continue;const t=this.hass.states[e.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const i=parseFloat(t.state);if(isNaN(i))continue;const s=t.attributes.device_class??"",a=Ei.find(t=>t.dc===s||"rssi"===t.key&&("signal_strength"===s||e.entity_id.includes("_rssi")));a&&o(a.key)&&n(a.key,i)}const r=(t?this._config.area_styles?.[t]?.energy_period:void 0)??this._config.energy_period??"total",l=[];for(const t of Ei){if("energy"===t.key&&o("energy")&&"total"!==r){let i=0,s=!1,o=!1;for(const t of e)for(const e of this._energyEntitiesFor(t)){const t=this._periodEnergyValue(e,r);t.failed?o=!0:null!=t.kwh&&(i+=t.kwh,s=!0)}if(o){a.energy&&l.push({key:"energy",label:t.label,value:this._formatAreaChip("energy",a.energy.sum)});continue}if(s||a.energy){const e=it("today"===r?"energy.today":"week"===r?"energy.week":"energy.month");l.push({key:"energy",label:e,value:s?ri(i):"…"})}continue}const i=a[t.key];if(!i)continue;const s="sum"===t.agg?i.sum:i.sum/i.count;l.push({key:t.key,label:t.label,value:this._formatAreaChip(t.key,s)})}return l}_areaChipDeviceValues(e,t,i){const s=Ei.find(e=>e.key===t);if(!s)return[];if("energy"===t){const t=(i?this._config.area_styles?.[i]?.energy_period:void 0)??this._config.energy_period??"total";if("total"!==t){const i=[];for(const s of e){let e=0,o=!1;for(const i of this._energyEntitiesFor(s)){const s=this._periodEnergyValue(i,t);null!=s.kwh&&(e+=s.kwh,o=!0)}o&&i.push({name:s.name,value:e})}if(i.length)return i.sort((e,t)=>t.value-e.value)}}const o=[];for(const t of e){let e=0,i=0;for(const o of t.entities){if("sensor"!==o.domain)continue;const t=this.hass.states[o.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const a=parseFloat(t.state);if(isNaN(a))continue;const n=t.attributes.device_class??"";(s.dc===n||"rssi"===s.key&&("signal_strength"===n||o.entity_id.includes("_rssi")))&&(e+=a,i++)}i&&o.push({name:t.name,value:"sum"===s.agg?e:e/i})}return o.sort((e,t)=>t.value-e.value)}_formatAreaChip(e,t){switch(e){case"power":return ni(t);case"energy":return ri(t);case"voltage":return li(t);case"current":return ci(t);case"temperature":return di(t);case"humidity":return fi(t);case"co2":return bi(t);case"illuminance":return mi(t);case"battery":return yi(t);case"rssi":return`${Math.round(t)} dBm`;default:return String(Math.round(t))}}_renderCollapseAll(e){const t=e.every(e=>this._closedAreas.has(e));return q`
      <button class="collapse-all"
        title=${it(t?"header.expand_every_room":"header.collapse_every_room")}
        aria-label=${it(t?"header.expand_every_room":"header.collapse_every_room")}
        @click=${i=>{i.stopPropagation(),t?this._closedAreas=new Set:(this._closedAreas=new Set(e),this._areaChipOpen=null)}}>
        <span class="ca-chev ${t?"":"open"}">▼</span>
        <span class="ca-lbl">${it(t?"header.expand_all":"header.collapse_all")}</span>
      </button>`}_applyAreaTheme(e,t){const i=es(void 0,t);if(!i)return;const s=qe(i);s&&(s.card_bg&&(e.backgroundColor=s.card_bg),s.accent_color&&(e["--sc-accent"]=s.accent_color,e["--sc-graph-line"]=s.accent_color,e["--sc-accent-glow"]=`${s.accent_color}59`),s.tile_bg&&(e["--sc-tile-bg"]=s.tile_bg),s.tile_border&&(e["--sc-tile-border"]=s.tile_border),s.tile_hover_bg&&(e["--sc-tile-hover-bg"]=s.tile_hover_bg),s.tile_hover_shadow&&(e["--sc-tile-hover-shad"]=s.tile_hover_shadow),s.tile_sensor_bg&&(e["--sc-sensor-bg"]=s.tile_sensor_bg),s.tile_exp_bg&&(e["--sc-tile-exp-bg"]=s.tile_exp_bg),s.text_primary&&(e["--sc-text-primary"]=s.text_primary),s.text_secondary&&(e["--sc-text-secondary"]=s.text_secondary),s.text_muted&&(e["--sc-text-muted"]=s.text_muted),s.online_color&&(e["--sc-online-color"]=s.online_color),s.offline_color&&(e["--sc-offline-dot"]=s.offline_color),s.power_color&&(e["--sc-power-color"]=s.power_color),s.area_header_color&&(e["--sc-area-header-color"]=s.area_header_color))}_applyTileTheme(e,t){const i=function(e){const t=e=>e&&"custom"!==e?e:void 0;return t(ji(e)?.theme)??t(Hi(e)?.theme)}(t);if(!i)return;const s=qe(i);s&&(s.accent_color&&(e["--sc-accent"]=s.accent_color,e["--sc-graph-line"]=s.accent_color,e["--sc-accent-glow"]=`${s.accent_color}59`),s.tile_bg&&(e["--sc-tile-bg"]=s.tile_bg),s.tile_border&&(e["--sc-tile-border"]=s.tile_border),s.tile_hover_bg&&(e["--sc-tile-hover-bg"]=s.tile_hover_bg),s.tile_hover_shadow&&(e["--sc-tile-hover-shad"]=s.tile_hover_shadow),s.tile_sensor_bg&&(e["--sc-sensor-bg"]=s.tile_sensor_bg),s.tile_exp_bg&&(e["--sc-tile-exp-bg"]=s.tile_exp_bg),s.text_primary&&(e["--sc-text-primary"]=s.text_primary),s.text_secondary&&(e["--sc-text-secondary"]=s.text_secondary),s.text_muted&&(e["--sc-text-muted"]=s.text_muted),s.online_color&&(e["--sc-online-color"]=s.online_color),s.offline_color&&(e["--sc-offline-dot"]=s.offline_color),s.power_color&&(e["--sc-power-color"]=s.power_color))}_renderAreaSection(e,t){if(!t.length)return q``;const i=e||"No Area",s=e||it("header.no_area"),o=this._closedAreas.has(e),a=t.filter(e=>this._isOnline(e)).length,n=this._config.area_styles?.[i],r=Ji(this._config,this._getActiveView()??void 0,n),l={};if(this._applyAreaTheme(l,n),n){if(n.bgColor&&(l.backgroundColor=n.bgColor),(n.borderColor||n.borderWidth)&&(l.border=`${n.borderWidth??1}px ${n.borderStyle??"solid"} ${n.borderColor??"var(--divider-color)"}`),n.borderRadius&&(l.borderRadius=`${n.borderRadius}px`,l.overflow="hidden"),n.bg_image){l["--area-bg-image"]=`url("${n.bg_image}")`,l["--area-bg-image-sz"]="ambient"===n.bg_image_mode?"cover":"stretch"===n.bg_image_size?"100% 100%":n.bg_image_size??"cover";const e=n.bg_image_pos;l["--area-bg-pos"]="top"===e?"center top":"bottom"===e?"center bottom":"center"}n.headerBgColor&&(l["--area-header-bg"]=n.headerBgColor2?`linear-gradient(${n.headerBgDir??"to right"}, ${n.headerBgColor}, ${n.headerBgColor2})`:n.headerBgColor);const e=n.textColor??n.headerTextColor;if(e&&(l["--area-header-color"]=e),n.fontSize&&(l["--area-name-size"]=`${n.fontSize}px`),n.fontWeight&&(l["--area-name-weight"]=n.fontWeight),n.fontStyle&&(l["--area-name-style"]=n.fontStyle),n.boxShadow&&"none"!==n.boxShadow&&(l.boxShadow="soft"===n.boxShadow?"0 2px 8px rgba(0,0,0,.28)":"medium"===n.boxShadow?"0 4px 16px rgba(0,0,0,.38)":"0 8px 28px rgba(0,0,0,.5)"),n.tileBgColor&&(l["--sc-tile-bg"]=n.tileBgColor),n.tileBorderColor&&(l["--sc-tile-border"]=n.tileBorderColor),null!=n.tileBorderRadius&&(l["--tile-radius"]=`${n.tileBorderRadius}px`),null!=n.tileGap&&(l["--tile-gap"]=`${n.tileGap}px`),n.tileTextColor&&(l["--sc-text-primary"]=n.tileTextColor),n.accentColor&&(l["--sc-accent"]=n.accentColor,l["--sc-graph-line"]=n.accentColor,l["--sc-accent-glow"]=`${n.accentColor}59`),null!=n.bgOpacity&&n.bgOpacity<100){const e=l.backgroundColor??l["--sc-card-bg"];e&&(l.backgroundColor=`color-mix(in srgb, ${e} ${Math.max(0,n.bgOpacity)}%, transparent)`)}if(null!=n.tileOpacity&&n.tileOpacity<100&&(l["--sc-tile-bg-opacity"]=String(Math.max(0,n.tileOpacity)/100)),n.buttonShape||n.buttonVariant||n.buttonSize){const e=n.buttonShape??"pill",t=n.buttonVariant??"fill",i=n.buttonSize??"md",s="square"===e||"circle"===e,o={sm:"2px 8px",md:"4px 11px",lg:"6px 16px"},a={sm:"3px 5px",md:"4px 8px",lg:"6px 12px"};l["--tog-radius"]="pill"===e?"20px":"rect"===e||"square"===e?"6px":"50%",l["--tog-pad"]=s?a[i]??a.md:o[i]??o.md,l["--tog-fsize"]="sm"===i?".65em":"lg"===i?".8em":".72em",l["--tog-aspect"]=s?"1":"auto","outline"===t?(l["--tog-on-bg"]="transparent",l["--tog-on-border"]="1px solid var(--sc-accent)",l["--tog-on-color"]="var(--sc-accent)",l["--tog-on-shadow"]="none"):"ghost"===t&&(l["--tog-on-bg"]="transparent",l["--tog-on-border"]="none",l["--tog-on-color"]="var(--sc-accent)",l["--tog-on-shadow"]="none")}}const c=n?.tile_style,d=this._getAreaChips(t,i);return q`
      <div class="area-section ${o?"closed":""} ${n?.bg_image&&"ambient"===n.bg_image_mode?"area-bg-ambient":""}" style=${ke(l)}>
        <div class="area-header" @click=${()=>{const t=new Set(this._closedAreas);t.has(e)?t.delete(e):(t.add(e),this._areaChipOpen?.startsWith(`${e}::`)&&(this._areaChipOpen=null)),this._closedAreas=t}}>
          <span class="area-name">${s}</span>
          ${d.length?q`
            <div class="area-chips">
              ${d.map(t=>{const i=`${e}::${t.key}`;return q`
                <div class="area-chip ${this._areaChipOpen===i?"active":""}"
                  title="Tap to see which device"
                  @click=${e=>{e.stopPropagation(),this._areaChipOpen=this._areaChipOpen===i?null:i}}>
                  <span class="tsc-lbl">${t.label}</span>
                  <span class="tsc-val">${t.value}</span>
                </div>`})}
            </div>`:Y}
          <div class="area-meta">
            <span class="area-count">${a}/${t.length}</span>
            <span class="chevron ${o?"":"open"}">▼</span>
          </div>
        </div>
        ${(()=>{const i=this._areaChipOpen;if(!i||!i.startsWith(`${e}::`))return Y;const o=i.slice(e.length+2),a=this._areaChipDeviceValues(t,o,s);if(!a.length)return Y;const n=Ei.find(e=>e.key===o);return q`
            <div class="area-chip-detail" @click=${e=>e.stopPropagation()}>
              <div class="acd-hdr">${n?.label??o} · ${a.length} device${a.length>1?"s":""}</div>
              <div class="acd-list">
                ${a.map(e=>q`
                  <div class="acd-row">
                    <span class="acd-name">${e.name}</span>
                    <span class="acd-val">${this._formatAreaChip(o,e.value)}</span>
                  </div>`)}
              </div>
            </div>`})()}
        ${o?Y:(()=>{const e=this._config.area_cards?.[s],i="grid"===(o=this._config,a=this._getActiveView()??void 0,a?.area_card_placement??o.area_card_placement??"above");var o,a;return q`
            ${i?Y:this._renderExtraCards(e)}
            <div class="device-grid" style="--cols:${r}">
              ${i?this._renderGridCards(e,r):Y}
              ${Oe(t,e=>e.device_id,e=>this._renderTile(e,c))}
            </div>`})()}
      </div>
    `}render(){if(!this._config||!this.hass)return q``;const e=new Set(["hui-card-picker","hui-cards-used-card-picker"]);let t=this,i=!1;for(;t;){if(t instanceof Element&&e.has(t.tagName.toLowerCase())){i=!0;break}const s=t.getRootNode();if(s===t||s===document)break;t=s.host}if(i)return q`
        <ha-card>
          <div style="padding:20px;text-align:center;color:var(--secondary-text-color,#9ca3af);">
            <div style="font-size:2em;margin-bottom:8px">📡</div>
            <div style="font-weight:600;margin-bottom:4px">${it("picker.title")}</div>
            <div style="font-size:.85em">${it("picker.subtitle")}</div>
          </div>
        </ha-card>`;const s=this._getDevices();if(!s.length)return q`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">No devices found matching your filters.</p>
          </div>
        </ha-card>`;const o=this._getActiveView(),a=o?this._applyViewFilter(s,o):s,n=this._groupByArea(a),r=!o||!0===o.show_favourites,l=o?!1!==o.show_rooms:!1!==this._config.show_rooms,c=!0===this._config.header_show_cloud?Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("binary_sensor.")&&e.entity_id.endsWith("_cloud")):[],d=c.filter(e=>"on"===e.state),p=c.filter(e=>"off"===e.state),h=c.filter(e=>"unavailable"===e.state),u=e=>(e.attributes.friendly_name??e.entity_id).replace(/\s*[Cc]loud$/,"").trim(),g=this._buildCardStyles(),v=this._detailDevice?this._getDevices().find(e=>e.device_id===this._detailDevice)??null:null,f=v?zs(this._buildTileCtx(v,this._profile(v),this._tileAccent(v,v.area??""))):Y,m=q`
      <ha-card class=${this._config.effects?"":"no-fx"} style=${ke(g)} @click=${()=>{this._cloudDetailOpen&&(this._cloudDetailOpen=null)}}>
        ${f}
        ${this._renderConfirmOff()}
        ${!1===this._config.show_header?Y:q`
        <div class="dash-header">
          <div class="dash-header-bg"></div>
          ${!1!==this._config.header_show_title?q`
            <span class="dash-title">${this._config.title??"Shelly"}</span>`:Y}
          ${!1!==this._config.header_show_stats?this._renderHeaderChips(a):Y}
          ${!0===this._config.header_show_cloud?q`
            <div class="cloud-chips">
              <span class="cloud-chip cloud-on ${"on"===this._cloudDetailOpen?"active":""}"
                @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="on"===this._cloudDetailOpen?null:"on"}}>
                ● ${d.length} online</span>
              <span class="cloud-chip cloud-off ${"off"===this._cloudDetailOpen?"active":""}"
                @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="off"===this._cloudDetailOpen?null:"off"}}>
                ● ${p.length} offline</span>
              ${h.length>0?q`
                <span class="cloud-chip cloud-unavail ${"unavailable"===this._cloudDetailOpen?"active":""}"
                  @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="unavailable"===this._cloudDetailOpen?null:"unavailable"}}>
                  ● ${h.length} unavailable</span>`:Y}
            </div>`:Y}
        </div>`}
        ${"on"===this._cloudDetailOpen?q`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-on">● Online — ${d.length} devices</div>
            <div class="cloud-grid">
              ${d.map(e=>q`<div class="cloud-item">${u(e)}</div>`)}
            </div>
          </div>`:Y}
        ${"off"===this._cloudDetailOpen?q`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-off">● Offline — ${p.length} devices</div>
            <div class="cloud-grid">
              ${p.map(e=>q`<div class="cloud-item">${u(e)}</div>`)}
            </div>
          </div>`:Y}
        ${"unavailable"===this._cloudDetailOpen?q`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-unavail">● Unavailable — ${h.length} devices</div>
            <div class="cloud-grid">
              ${h.map(e=>q`<div class="cloud-item">${u(e)}</div>`)}
            </div>
          </div>`:Y}
        ${this._renderHeaderDetail(a)}
        ${this._renderViewTabs()}
        ${this._renderDiscoveryNotice()}
        ${this._renderDelegateNotice(s)}
        ${this._renderExtraCards(Qi(this._config,o??void 0,"header_cards"))}
        <div class="dash-body">
          ${this._renderAttention(a)}
          ${r?this._renderFavoritesSection(s):Y}
          ${l&&n.size>0&&!1!==this._config.show_collapse_all?q`<div class="rooms-toolbar">${this._renderCollapseAll([...n.keys()])}</div>`:Y}
          ${l?Oe([...n.entries()],([e])=>e,([e,t])=>this._renderAreaSection(e,t)):q`<div class="device-grid" style="--cols:${o?.columns??this._config.columns??3}">
                ${Oe(a,e=>e.device_id,e=>this._renderTile(e,this._config.area_styles?.[e.area??""]?.tile_style))}
              </div>`}
        </div>
        ${this._renderExtraCards(Qi(this._config,o??void 0,"footer_cards"))}
      </ha-card>
    `;return m}_renderAttention(e){if(!1===this._config.show_attention)return q``;const t=function(e,t,i={}){const s=i.batteryBelow??20,o=[];for(const a of e){const e=[],n=[];if(os(a,t)){const o=rs(a,t);o.length&&(e.push("alert"),n.push(...o));const r=cs(a,t);null!==r&&r<=s&&(e.push("battery"),n.push(`battery ${Math.round(r)}%`));const l=ls(a,t,i)?ps(a,t,i):null;l&&(e.push("update"),n.push(`update → ${l.next}`))}else e.push("offline"),n.push("offline");e.length&&o.push({device:a,kinds:e,detail:n})}const a={offline:0,alert:1,battery:2,update:3},n=e=>Math.min(...e.kinds.map(e=>a[e]));return o.sort((e,t)=>n(e)-n(t)||e.device.name.localeCompare(t.device.name))}(e,this.hass.states,{batteryBelow:this._config.attention_battery,includeBeta:this._config.include_beta_updates}),i=!1===this._config.show_firmware_summary?[]:us(e),s=i.length>1;if(!t.length&&!s)return q``;const o={offline:"○",alert:"▲",battery:"▮",update:"↑"},a=e=>["offline","alert","battery","update"].find(t=>e.kinds.includes(t));return q`
      <div class="attention">
        <div class="att-hdr" @click=${()=>{this._attentionOpen=!this._attentionOpen}}>
          <span class="att-caret">${this._attentionOpen?"▾":"▸"}</span>
          <span class="att-title">${it("header.needs_attention")}</span>
          ${t.length?q`<span class="att-count">${t.length}</span>`:Y}
          ${s?q`<span class="att-fw-chip">${it("header.firmware_versions",{n:i.length})}</span>`:Y}
        </div>
        ${this._attentionOpen?q`
          <div class="att-body">
            ${t.map(e=>q`
              <button class="att-row att-${a(e)}" @click=${()=>{this._detailDevice=e.device.device_id}}>
                <span class="att-icon">${o[a(e)]}</span>
                <span class="att-name">${e.device.name}</span>
                <span class="att-why">${e.detail.join(" · ")}</span>
                ${e.device.area?q`<span class="att-area">${e.device.area}</span>`:Y}
              </button>`)}
            ${s?q`
              <div class="att-fw">
                <div class="att-fw-title">${it("header.firmware")}</div>
                ${i.map(t=>q`
                  <div class="att-fw-row ${t.current?"current":""}">
                    <span class="att-fw-ver">${t.version}</span>
                    <span class="att-fw-bar"><i style="width:${Math.round(t.devices.length/e.length*100)}%"></i></span>
                    <span class="att-fw-n">${t.devices.length}</span>
                    ${t.current?q`<span class="att-fw-tag">${it("header.newest")}</span>`:Y}
                  </div>`)}
              </div>`:Y}
          </div>`:Y}
      </div>`}_renderExtraCards(e){if(!e?.length)return q``;const t=this.preview||this.hasAttribute("data-edit-preview"),i="match"===Zi(this._config,this._getActiveView()??void 0);return q`
      <div class="extra-cards ${i?"xc-match":""}">
        ${e.map(e=>q`
          <hdd-card style=${ke(this._extraCardGrid(e))}
            .hass=${this.hass} .config=${e} .preview=${t}></hdd-card>`)}
      </div>`}_renderGridCards(e,t){if(!e?.length)return Y;const i=this.preview||this.hasAttribute("data-edit-preview"),s="match"===Zi(this._config,this._getActiveView()??void 0);return q`${e.map(e=>q`
      <hdd-card class="grid-card ${s?"xc-match":""}"
        style=${ke(this._gridCardSpan(e,t))}
        .hass=${this.hass} .config=${e} .preview=${i}></hdd-card>`)}`}_gridCardSpan(e,t){const i=e.grid_options;return i&&"object"==typeof i?"full"===i.columns?{"grid-column":"1 / -1"}:"number"==typeof i.columns&&i.columns>1?{"grid-column":`span ${Math.min(Math.round(i.columns),Math.max(1,t))}`}:{}:{}}_extraCardGrid(e){const t=e.grid_options;if(!t||"object"!=typeof t)return{};const i={},s=t.columns;"number"==typeof s&&s>0&&s<12&&(i["grid-column"]=`span ${Math.round(s)}`);const o=t.rows;return"number"==typeof o&&o>1&&(i["min-height"]=`calc(${Math.round(o)} * var(--hdd-grid-row, 56px))`),i}_renderDelegateNotice(e){if(this._config.delegate_controls||this._delegateNoticeDismissed)return q``;const t=e.filter(e=>Tt(e).length>0).length;if(!t)return q``;const i=this.preview||this.hasAttribute("data-edit-preview"),s=i?q`<button class="dn-link" @click=${e=>{e.stopPropagation(),window.dispatchEvent(new CustomEvent("hdd-editor-goto",{detail:{tab:"design",section:"design-tiles",flash:"delegate_controls"}}))}}>${it("notice.native_controls")}</button>`:q`<b>${it("notice.native_controls")}</b>`;return q`
      <div class="delegate-notice">
        <span class="dn-icon">◈</span>
        <span class="dn-text">${it(1===t?"notice.delegate_one":"notice.delegate_many",{n:t})}
          ${s} ${it(i?"notice.delegate_here":"notice.delegate_editor")}</span>
        <button class="dn-dismiss" title=${it("action.dismiss")}
          @click=${e=>{e.stopPropagation(),this._dismissDelegateNotice()}}>×</button>
      </div>`}_renderViewTabs(){const e=this._config.views;if(!e?.length||e.length<2)return q``;const t=this._getActiveView()?.id;return q`
      <div class="view-tabs">
        ${e.map(e=>q`
          <button class="view-tab ${e.id===t?"active":""}"
            @click=${()=>this._setActiveView(e.id)}>
            ${e.icon?q`<ha-icon class="view-tab-icon" .icon=${e.icon}></ha-icon>`:Y}
            <span>${e.name}</span>
          </button>`)}
      </div>`}};Ns.BRIGHTNESS_MAX=255,Ns.PERIOD_ENERGY_TTL=3e5,Ns.PERIOD_ENERGY_RETRY=6e4,Ns._TILE_CONTROL_SEL="button, a, input, select, textarea, hdd-delegated, .ts-light-wheel, .trv-dial-svg, .valve-interactive, .tile-trv-dial, .input-row.tappable",Ns.styles=[n("\n@font-face {\n  font-family: 'Abril Fatface';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Bangers';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Graduate';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Limelight';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Lobster';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Pacifico';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Righteous';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n@font-face {\n  font-family: 'Special Elite';\n  font-style: normal;\n  font-weight: 400 700;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n}\n"),Ke,Xe,Qe,Ye,r`
      @media (max-width: 999px) {
        :host([data-edit-preview]) {
          display: block;
          max-height: 50vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    `],e([ve({attribute:!1})],Ns.prototype,"hass",void 0),e([ve({type:Boolean})],Ns.prototype,"preview",void 0),e([fe()],Ns.prototype,"_config",void 0),e([fe()],Ns.prototype,"_closedAreas",void 0),e([fe()],Ns.prototype,"_areaChipOpen",void 0),e([fe()],Ns.prototype,"_graphData",void 0),e([fe()],Ns.prototype,"_periodEnergy",void 0),e([fe()],Ns.prototype,"_periodEnergyErrAt",void 0),e([fe()],Ns.prototype,"_valveDragPos",void 0),e([fe()],Ns.prototype,"_trvDragTemp",void 0),e([fe()],Ns.prototype,"_cloudDetailOpen",void 0),e([fe()],Ns.prototype,"_detailDevice",void 0),e([fe()],Ns.prototype,"_confirmOff",void 0),e([fe()],Ns.prototype,"_detailHistoryRange",void 0),e([fe()],Ns.prototype,"_activeViewId",void 0),e([fe()],Ns.prototype,"_delegateNoticeDismissed",void 0),e([fe()],Ns.prototype,"_discoveryNoticeDismissed",void 0),e([fe()],Ns.prototype,"_attentionOpen",void 0),e([fe()],Ns.prototype,"_dimFeedback",void 0),Ns=Bs=e([he("ha-device-dashboard")],Ns);const js=(e,t)=>{const i=e._$AN;if(void 0===i)return!1;for(const e of i)e._$AO?.(t,!1),js(e,t);return!0},Hs=e=>{let t,i;do{if(void 0===(t=e._$AM))break;i=t._$AN,i.delete(e),e=t}while(0===i?.size)},Us=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(void 0===i)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),Gs(t)}};function Ws(e){void 0!==this._$AN?(Hs(this),this._$AM=e,Us(this)):this._$AM=e}function qs(e,t=!1,i=0){const s=this._$AH,o=this._$AN;if(void 0!==o&&0!==o.size)if(t)if(Array.isArray(s))for(let e=i;e<s.length;e++)js(s[e],!1),Hs(s[e]);else null!=s&&(js(s,!1),Hs(s));else js(this,e)}const Gs=e=>{e.type==be&&(e._$AP??=qs,e._$AQ??=Ws)};class Vs extends xe{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,i){super._$AT(e,t,i),Us(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(js(this,e),Hs(this))}setValue(e){if((e=>void 0===e.strings)(this._$Ct))this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}const Ys=new WeakMap,Ks=ye(class extends Vs{render(e){return Y}update(e,[t]){const i=t!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),Y}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){const t=this.ht??globalThis;let i=Ys.get(t);void 0===i&&(i=new WeakMap,Ys.set(t,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?Ys.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),Xs=ye(class extends xe{constructor(){super(...arguments),this.key=Y}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(Ie(e),this.key=t),i}});function Qs(e,t,i){const s=new Set(t),o=e.filter(e=>!s.has(e));return i&&o.push(...t),o.length?o:void 0}const Zs={kind:"global"};function Js(e,t){switch(t){case"tile":return!0;case"container":return"global"===e.kind||"view"===e.kind||"room"===e.kind;case"chrome":return"global"===e.kind||"view"===e.kind}}function eo(e){switch(e.kind){case"global":return"global";case"view":return`view:${e.id}`;case"room":return`room:${e.name}`;case"type":return`type:${e.profile}`;case"device":return`device:${e.id}`}}function to(e,t){switch(e.kind){case"global":return"Global";case"view":return`View · ${t.viewName(e.id)}`;case"room":return`Room · ${e.name||"No room"}`;case"type":return`Type · ${e.profile}`;case"device":return`Device · ${t.deviceName(e.id)}`}}const io={tile:["theme","color","tile_style","power_monitor_variant","tile_layout","sensors","show_graphs","elements","energy_period"],container:["columns","tile_size","tileGap","tile_gap"],chrome:["style","extra_card_style","area_card_placement"]},so=["bg_image","bg_image_size","tile_icon","tile_icon_off","tile_icon_speed","tile_icon_size","entity_animations","extra_sensors","radio_stations","input_actions","confirm_off"],oo=[...io.tile,...io.container,...io.chrome];function ao(e){return"device"===e.kind?[...oo,...so]:oo}function no(e){let t=(e??"").trim();if(t&&(t=t.replace(/^[a-z]+:\/\//i,""),t=t.split("/")[0].split(":")[0],/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(t)))return`https://${t}`}function ro(e,t,i=!1){if(e){if(/^https?:\/\//i.test(e))return e;if(e.startsWith("images/")){return"https://control.shelly.cloud/"+(i?e.replace(/_m\.(jpe?g|png)$/i,"_l.$1"):e)}if(e.startsWith("assets/")){const s=i?e.replace(/thumb_(?=[^/]+$)/,""):e;return`${t.replace(/\/$/,"")}/shelly_files/${s}`}}}function lo(e){return!!e&&e.startsWith("images/room_def/")}function co(e){const t=/^([0-9a-f]{12})(?:_\d+)?$/i.exec(e??"");return t?t[1].toLowerCase():void 0}const po=e=>e.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim();function ho(e,t){const i=new Map;for(const e of t){const t=new Set;for(const[i,s]of e.connections??[])"mac"===i&&t.add(s.replace(/[:-]/g,"").toLowerCase());for(const[i,s]of e.identifiers??[])"shelly"===i&&/^[0-9a-f]{12}$/i.test(s)&&t.add(s.toLowerCase());for(const s of t){const t=i.get(s)??[];t.push(e.id),i.set(s,t)}}const s=new Map;for(const t of e){const e=co(t.id);if(!e)continue;const o=i.get(e);o?.length&&s.set(e,o)}return s}const uo=[{id:"devices",label:"Rooms & devices",icon:"⌂",sections:[{id:"rooms-toolbar",label:"Rooms toolbar"},{id:"discovery",label:"Discovery"},{id:"lights",label:"What counts as a light"},{id:"extra-cards",label:"Extra cards"}]},{id:"views",label:"Views",icon:"☰",sections:[{id:"views-toolbar",label:"Views toolbar"},{id:"view-card",label:"Per-view card + filters"}]},{id:"design",label:"Design",icon:"◈",sections:[{id:"design-scope",label:"Scope"},{id:"design-panel",label:"Controls for the selected scope"},{id:"theme",label:"Colour theme"},{id:"content",label:"Chips & metrics"},{id:"tiles",label:"Tiles"},{id:"electrical",label:"Sensor chips — Electrical"},{id:"environmental",label:"Sensor chips — Environmental"},{id:"deviceinfo",label:"Sensor chips — Device info",advanced:!0},{id:"alerts",label:"Sensor chips — Alerts",advanced:!0},{id:"header",label:"Header"},{id:"card",label:"Card",advanced:!0},{id:"colors",label:"Colours"},{id:"typography",label:"Typography",advanced:!0}]},{id:"graphs",label:"Graphs & Sensors",icon:"∿",sections:[{id:"graphtype",label:"Graph Type"},{id:"graphcolors",label:"Per-sensor Colors",advanced:!0},{id:"graphranges",label:"Sensor Min / Max",advanced:!0}]},{id:"yaml",label:"YAML",icon:"</>",sections:[{id:"yaml-pane",label:"YAML output"}]}],go=[{id:"cascade",title:"Why a setting sometimes does nothing",body:["Almost every visual option can be set at several levels, and the most specific one wins. The order is: this device → this device type → this room → this view → the whole card → the built-in default.","That is why a per-device colour beats a room colour, and why a card-wide `tile_style` beats the per-profile defaults that `smart_tile_styles` turns on — the card-wide value is more specific than a built-in default, so smart styles never get a look in. Set styles per device type instead of card-wide if you want both.","For blocks there is one extra rung: a saved custom style's own layout sits above the room and card-wide values, since choosing a saved look is more deliberate than leaving the global default in place.","The editor flags the common cases for you — see Conflicts."]},{id:"design-scopes",title:"Where a setting lives",body:["Everything about how the card looks is in one tab: **Design**. It is *scope-first* — you pick **where** you are editing, and the same control list redraws for that layer. Global, a view, a room, a device type, or one device.","Pick the scope in the map at the top. Devices are grouped by room, type or integration; room and type headings are clickable because they are layers you can style, while an integration is only a way to find a device. The number on a chip is how many settings that layer overrides, so you can see where customisation lives without opening everything.","Every control says where its value is coming from — **set here**, with a ↺ to drop it, or **from Room · Kitchen** / **from Card**. Most specific wins, always.","What you can set depends on the layer, and the tab says why. There are three groups. **Tile** settings — theme, colour, tile style, blocks, chips, graphs, energy window — can be set anywhere: device, type, room, view, card. **Container** settings — columns and tile size — stop at the room, because a grid needs something to hold it and one device has no column count. **Card chrome** — the header, the card surface, typography — only a view or the card can set, because a room does not contain the card's header.","Two scopes also hold settings with no ladder under them at all. Global has the theme picker, chips & metrics, tiles, the sensor-chip groups, and the card's own header and type. A room has **Room chrome** — the room block's backdrop photo, tile gap, header colours, borders, per-room header chips and button shapes — things that exist exactly once per room.","A shortcut worth knowing: in the card editor, tapping a device tile in the **live preview** jumps straight to that device's scope in Design — same landing as the ✎ button in Rooms & devices. Buttons and sliders on the tile still work normally, so you can test controls in the preview too."]},{id:"content-defaults",title:"Global defaults vs. per-room overrides",body:["The **Chips & metrics** section in Design (at Global scope) sets three things card-wide: which chips each room header shows, which window the energy readout totals (Total / Today / Week / Month), and which sensor chips appear on tiles. Treat it as the first stop — decide what data is on show, then style it.","These are *defaults*. Every room and device inherits them, but any room or device can override any of them — by picking that room or device as the scope in Design — and the moment it does, it stops listening to the global. A global toggle only moves scopes that are still inheriting: turning a chip on globally will **not** turn it on in a room that has set its own chips, and turning it off will not turn it off there.",'Each picker tells you which state it is in. **Inheriting from …** means a global change still reaches it; **Custom selection** means it is pinned to its own value. Setting a room or device to an empty selection is itself a custom choice ("show none"), not the same as inheriting.',"To hand control back to the global default, use that scope's reset — `↺ Default` for room header chips, `↺ Inherit` for the chip pickers. Room header chips resolve room → global → built-in; energy and sensor chips also allow a per-device override (and, for sensor chips, a per-type one) in front of the room."]},{id:"named-sensors",title:"Computers, servers and anything without a device_class",body:["Most chip and graph settings are keyed by Home Assistant's **device class** — `temperature`, `power`, `battery`. That works for hardware that reports one. Plenty does not: CPU load, memory use, free disk and most figures from a PC, NAS, router, Proxmox or VM host arrive with no device class at all, so no class key can name them.",'Wherever the card asks *which sensors*, you can give a specific **entity id** instead of a class, in the same list. `sensors: [temperature, sensor.davidpc_cpuload]` means "the temperature chip, and that exact reading". The card tells the two apart by the dot — every entity id has one, no device class does.',"A named entity only ever appears on the device that owns it. That is what lets one list configure a whole fleet at once: name your PC's CPU sensor and your router's CPU sensor in the same card-wide list, and each tile picks up only its own.","On the **Sensor card** tile style the first entity you name is also the big number the tile leads with, and the order you name them is the order the chips appear — so naming entities is how you build a tile that shows exactly what you want, in the order you want it.","`graph_sensors` takes the same mixed list, so you can plot readings that have no class either. Named lines are drawn first, in the order given.","In the editor, both pickers carry a **Specific entities** field under the class pills — under **Design → Sensor chips** for a tile, and **Graphs & Sensors → Graph Type** for the graphs. Picked on a single device, it offers that device's own entities; card-wide it offers anything. Ticking **All** leaves the entities you named alone, since no pill stands for them; **None** clears everything."]},{id:"discovery",title:"Discovery: what the card looks at",body:['**Shelly mode** (the default) keeps only Shelly and BTHome devices. Most "my device is missing" reports are simply this.',"**Universal mode** discovers every device in Home Assistant, then narrows it three ways: a *scope* (real devices / controllable only / everything), a built-in deny-list of things that are not really devices (phones, browsers, routers, the supervisor), and your own Hide integrations / Hide entity types lists on top.","The two hide lists resolve in opposite directions, which is worth knowing: for domains, excluding wins; for integrations, `include_integrations` is a force-include that overrides the deny-list. That is how you bring one router back without unhiding all of them.","Shelly devices keep their full-fidelity detection in universal mode — model, generation, per-channel merging — so switching modes never downgrades them."]},{id:"profiles",title:"Profiles, tile styles and blocks are three different things",body:["A **profile** is what the card decides a device *is* — relay, dimmer, cover, sensor, input, and so on — from its entities, refined by Shelly model. It drives the badge, the default chips and the default layout. You can override it per device if the guess is wrong.","A **tile style** is how that device is drawn: the adaptive block tile (`default`), or a purpose-built one (power monitor, light control, climate dial, cover, sensor card, input keypad, scene button).","A **block** is one row of content inside the `default` style only — name row, chips, graph, dimmer, cover controls, and so on. Setting blocks on a device that renders as a power monitor does nothing, because that style does not use blocks; use its Elements instead."]},{id:"hiding",title:"Blocks, elements and chips — which one hides what",body:['**Blocks** reorder and hide the parts of the `default` tile. **Elements** show and hide the parts of every other style (its toggle, graph, secondary readings…) — and carry the odd placement choice, like "Chips in the name row" on the power-monitor and sensor styles, which moves the secondary readings up beside the device name. **Sensor chips** choose which measurements appear as little pills, in any style.',"The editor only offers what applies: pick a power-monitor style and the block grid disappears in favour of that style's elements.","Design narrows to whatever scope you pick: choose one device and it offers only the chips that device can produce and the blocks it can render — an i4 offers only the chips it can actually produce and the blocks it can actually render. Flip **All options** at the top of that panel if you want the full surface back."]},{id:"inputs",title:"Input devices have no output",body:['An input is one of two things, and the card reads which from Home Assistant. A **button** input is momentary — it reports presses (single, double, long) on an `event` entity, and its row shows the last press and how long ago. A **switch** input is steady — it reports its position on a `binary_sensor`, and its row shows an ON/OFF pill. Relays have inputs too: a Plus 1PM\'s "Input 0" is the wall switch wired to it.',"An input that is wired to an output on its own device (`input_0` → `switch_0`) needs no setup: tapping its row toggles that output, and the row lights with the output's state. That is the one thing the physical input does that Home Assistant can replay.",'A Shelly i3, i4 or UNI has no output of its own — it reports presses and controls nothing by itself, so the card cannot "push" a channel for you. What it can do is run the same thing the physical button runs. In Design, pick the device as the scope and use **Input actions**: give a channel an action and its row becomes a key — tap toggles an entity or runs a script, hold dims the target light (alternating direction each hold, like a wall dimmer), double-tap runs a second action, and an optional dropdown exposes a `select` entity such as WLED presets.',"A key that toggles something lights up while that thing is on, so the tile doubles as a status display. A key that runs a script stays neutral — the card cannot know a script's state and will not pretend to. Channels you have not wired stay as status rows; tapping one opens its press history."]},{id:"lights",title:"What counts as a light",body:["The **Lights** header chip counts `light` entities that are on. A relay or plug wired to a lamp is a `switch` as far as Home Assistant is concerned — it has no way to know what is on the other end of the wire, and neither does the card.","You do. Label those devices in Home Assistant (Settings → Areas & labels), then tick the label under **Header → What counts as a light**. Every `switch` on a labelled device is counted from then on. The picker only offers labels that exist on your devices, with how many carry each.","For the stragglers a label does not cover, name entities directly in the same panel. A device caught by both routes is still counted once."]},{id:"themes",title:"Themes and colours",body:["The **theme** is authoritative: every colour comes from the preset you pick. The `style` block holds only colours you deliberately changed on top.","**Follow HA** is the exception: instead of a palette it points every colour at Home Assistant’s own theme variables, so the card matches whatever HA theme is active and follows it into light or dark. Available per card, per view and per room like any other theme.","Picking a theme clears those overrides, so the editor offers to save your current colours first — they come back under a ★ Saved entry in the theme picker.","Older configs wrote the whole palette into `style`, which shadowed the theme and made switching it do nothing. Those are migrated automatically on load: a palette that exactly matches a preset collapses back to the theme name, while a partial palette is left alone as the genuine override it is.","A **view** and a **room** can each take a theme of their own, resolved room → view → card. A view theme repaints the whole card, header included, while that view is showing, and outranks the colours in `style`. A room theme repaints what the room contains — its block background, tiles, text, accent and its own header — but not the card header, which no room encloses; the room's individual colour fields still override it key by key."]},{id:"energy",title:"Energy: totals versus windows",body:["By default the energy chip shows a device's lifetime total, straight from its own sensor. Switch it to Today, This week or This month and the card asks the recorder for consumption over that window instead — no helper entities required.","A device with several energy sensors (a Pro 4PM has one per channel) is summed, not sampled, so a multi-channel device is not under-counted.","If you already keep a Utility Meter for a device, point `energy_entity` at it. That replaces the device's own energy chips everywhere — tile, room total and header — so the override never sits next to the raw numbers it stands in for."]},{id:"attention",title:"Needs attention",body:["A fifty-device dashboard hides its own problems — three offline devices among fifty tiles is something you scroll past. The summary above the rooms answers the question the tiles cannot: which ones.","It lists offline devices, firing alerts, flat batteries and pending updates, worst first. Each row opens that device. It is invisible when nothing qualifies, so it costs nothing on a good day.","An offline device is reported as offline and nothing else — its last alert reading is stale, not news.","The firmware block groups the fleet by version and marks the newest, so a device left behind on an old build is obvious. It appears only when more than one version is running.",'**Beta firmware does not count as an update.** A Shelly exposes a `beta_firmware` entity that is on nearly permanently — on one real fleet that was 21 of 25 "available updates". Turn on `include_beta_updates` if you actually run betas.']},{id:"conflicts",title:"The Conflicts panel",body:["When a setting is overridden or ignored, a badge appears above the editor tabs. It exists because the failure is otherwise silent — the option is valid, it just never applies.","It watches for: a theme its `style` block contradicts, smart tile styles masked by a card-wide style, discovery filters set while in Shelly mode, an integration or domain in both the include and exclude lists, the Native controls block with the feature switched off, a saved style that no longer exists, styling attached to a device or room that is gone, input actions pointing at missing entities, hide lists that hide absolutely everything, keys the card does not read at all, and an input action whose channel has been renamed out from under it.","Nothing there is an error — a stale block is harmless. It is a list of things that are not doing what they look like they are doing."]}],vo=[{id:"first-run",title:"Start from scratch",body:["A new card discovers your Shelly and BTHome devices and groups them by room. Everything below is optional."],steps:["Edit dashboard → Add card → HA Device Dashboard.",'To include non-Shelly devices: Rooms & devices → Discovery → Universal, then pick a scope. Start with "Real devices".',"Set the look once under ◆ Defaults (theme, columns, tile size).","Use ◆ Defaults → Reset look if you want the factory appearance back without losing rooms, devices or actions."]},{id:"one-device",title:"Use the card for a single device",body:["The card is built for a fleet, but nothing stops it being one tile on an ordinary dashboard — a plug beside your other cards, with the same tile styles, graphs and confirmation you use everywhere else."],steps:['Rooms & devices → turn on Advanced → "Show only these devices" → tick the one you want.','Design → Global → Header → turn off "Show the header", unless you want its one-device summary.','Design → Global → Header → turn off "Group by room" so there is no room heading over a single tile, and set Columns to 1. (Per-view, the same switch lives in Views.)','Everything else still applies: pick a tile style, turn on graphs, set "Ask before turning off" if it is a load you do not want to lose.']},{id:"confirm-off",title:"Guard a device you must not switch off by accident",body:["A freezer, a server, the router, the heating — a mis-tap costs you something real. Turning the device ON is never confirmed, so the guard only slows you down in the direction that hurts.","It is set per device on purpose. Two identical plugs in the same room can disagree, which is what you want: arming a whole type or room would put the prompt in front of you constantly and train you to tap straight through it."],steps:["Design → pick the device in the scope picker.",'Under "Safety — this device only", turn on "Ask before turning off".','Tapping OFF now opens a prompt. Cancel is the wide button; the red "Turn off" is the narrow one.',"It covers every on/off the card draws for that device, including the per-channel relay rows and the detail sheet. It cannot cover a control drawn by Home Assistant itself under Native controls."]},{id:"extra-card-layout",title:"Show an embedded card only sometimes, or put two side by side",body:["Cards you embed under Extra cards are rendered by Home Assistant itself, so anything a card can normally do in a dashboard it can do here."],steps:["Extra cards → pick the placement (header, footer or a room) → Add card.","Edit it with Home Assistant's own form for that card type, or switch to YAML — the value carries across either way. A card that ships no visual editor falls back to YAML and says so.","The Preview underneath draws the card as you go, exactly as the dashboard will — including an error card if the config is wrong.",'Header and footer cards can differ per view: set "Applies to" to a view and that view gets its own list, replacing the card-wide one. An empty list on a view means no cards there at all. "Use the card-wide list" clears the override.',"Use ▲ ▼ on a row to reorder.",'For a room, "Where in the room" puts the cards above the tiles (a strip) or among them (each card takes a tile\'s place). In the grid, grid_options.columns counts tiles rather than twelfths.',"Set Look to \"Match this card\" and embedded cards take the dashboard's background, border, radius, text and accent instead of Home Assistant's theme — so they sit in the card rather than on it. A card that hard-codes its own colours keeps them.","To show it conditionally, give the card a `visibility:` block — the same state, user and screen conditions a dashboard card takes. A card hidden by its condition leaves no gap.","To make it narrower, give it `grid_options: {columns: 6}` — the strip is twelve columns wide, so two sixes sit side by side. Leave `grid_options` out for full width.","`rows` sets a minimum height; the strip grows to fit its content rather than clipping."]},{id:"hide-onoff",title:"Hide the on/off button on a tile",body:["For a device you only want to watch, or one whose switching belongs somewhere else."],steps:["Design → pick the scope (device, type, room, view or Global).",'Open the tile style block and untick "On/off button".',"Available on the default, Power and Light tile styles — the three that draw a primary on/off button.","The device can still be switched from its detail sheet; this hides the button on the tile."]},{id:"quiet",title:"Quieten a noisy universal dashboard",body:["Universal mode surfaces everything, including things that are not really devices. Two lists trim it."],steps:["Rooms & devices → Discovery.","Open Hide integrations and tick what you do not want. Use Hide all, then untick the few you do want.","Do the same in Hide entity types for whole domains such as update or camera.","Still too much? Drop the scope from Everything to Real devices."]},{id:"cloud-import",title:"Import your Shelly app setup",body:["Coming from the Shelly app? The card can pull each room's photo and the official product image for every device from your Shelly Cloud account. The auth key is used for the one fetch and never saved; imported images stay hosted on Shelly's cloud."],steps:["Get your key: control.shelly.cloud → user settings → Authorization cloud key. Note the server shown next to it.","Rooms & devices → Import from Shelly Cloud → paste both → Fetch my Shelly setup.","Pair any cloud rooms that did not auto-match with a room here (name matching ignores accents).","Pick what to import — room photos, product images on tiles, full-size vs thumbnails — and Apply.","A custom room photo's cloud URL is unlisted but not private. Swap in a /local/… photo later if that matters.","To invalidate a key you have shared or leaked, change your Shelly account password — the key only rotates with it."]},{id:"room-style",title:"Give one room its own look",body:["Room styling is keyed by the room name, so renaming an area in Home Assistant orphans it — the Conflicts panel will tell you."],steps:["Design → Scope → pick the room (or expand it to reach one device).","Pick the room, then set its colours, tile style, columns or backdrop.","Anything you leave alone keeps inheriting from the card-wide settings."]},{id:"wire-input",title:"Make an i3 / i4 button control a light",body:["The card only reacts to taps on the screen — it cannot give the wall button a job. The physical press is handled by the Shelly's own action/script or by a Home Assistant automation, and which of those you have decides the setup.","A relay with its own output (a 1PM, a Dimmer) needs none of this: its input toggles its own relay by default."],steps:["Design → Scope → expand a room → pick the switch → Input actions.",'No automation, Shelly handles the wall itself: choose "Toggle entity" and enter the light, e.g. light.hall. Several entities work too, comma separated.','An automation already reacts to the button (a Shelly "Button N single push" device trigger): choose "Replay the press" instead — the row fires the same event the wall does, the automation runs, and nothing is configured twice. Hold and double tap can replay long and double pushes the same way.','Set "On hold" to "Dim the light while held" for a dimmer. Hold brightens, release, hold again darkens.',"Optionally set a double-tap action, or point the Dropdown field at a select entity such as select.wled_preset.",'If the switch does not show a keypad, its tile style is set elsewhere — set Device type "Input" to the Inputs style, or use the per-type panel.']},{id:"extra-sensors",title:"Show a reading from another device on a tile",body:["A Wall Display XL has a light sensor but no temperature or humidity sensor; the room's readings come from a BLU H&T beside it. Borrow them and the tile shows them as its own — chips, graphs, gauge rings and the detail sheet included."],steps:["Design → Scope → expand the room → pick the device → Extra sensors.","Search for the sensor entity on the other device (sensor.blu_ht_temperature, say) and pick it. Several work.","The other device keeps showing the reading too, and a borrowed sensor never decides whether this device counts as online."]},{id:"colours",title:"Roll a colour scheme",body:["The theme picker can roll a look for you, and keep the ones you like as named palettes."],steps:["Design → Colour theme. Global sets the card; pick a view, room, type or device first to set one just there.","🎲 Random lands on one of the built-in presets.","✨ Surprise me generates a palette from a random hue instead. Every text colour is contrast-checked against the surface behind it, so a roll is never unreadable.","💾 Save keeps the colours you are looking at under a name — including a preset you have tweaked. Saved palettes appear as ★ swatches in the picker; ✕ on a swatch forgets it.","Rolling stashes the current colours as “Before roll” first, and picking a preset stashes them as “Before theme change”, so neither is a one-way door."]},{id:"snapshots",title:"Save a setup you can get back",body:["Snapshots capture the whole card config. Slots live in this browser; the file export is what moves between devices."],steps:["Toolbar → 💾 Save → name it.","To restore: 📂 Load → pick it from the list.","Before anything drastic, use 📂 Load → Export to file and keep the JSON somewhere safe.","A config with embedded background photos can outgrow browser storage — if it warns you, use the file export."]},{id:"native",title:"Show media players, locks, fans and vacuums",body:["The card does not draw these itself; it can embed Home Assistant's own controls for them."],steps:["Design → Tiles (Global scope) → turn on Native controls.","It is off by default because each one embeds a native element, which costs render time on a large media fleet.",'The controls appear as the "Native controls" block on the default tile style.']},{id:"views",title:"Split a big dashboard into views",body:["Views are tabs inside the card, each with its own filter and layout — useful once one scrolling wall stops being readable."],steps:["Views → Add view, name it, give it an icon.","Filter it by room, device type, or specific devices.","Override columns, tile size or tile style per view if that view needs a different density.","Pin the handful of devices you touch daily with Favourites, and let a view show only those."]}],fo=e=>Math.random()<e;const mo=(e,t,i)=>{const s=t/100*Math.min(i/100,1-i/100),o=t=>{const o=(t+e/30)%12,a=i/100-s*Math.max(-1,Math.min(o-3,9-o,1));return Math.round(255*a).toString(16).padStart(2,"0")};return`#${o(0)}${o(8)}${o(4)}`},bo=e=>{const t=[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255).map(e=>e<=.03928?e/12.92:((e+.055)/1.055)**2.4);return.2126*t[0]+.7152*t[1]+.0722*t[2]},yo=(e,t)=>{const[i,s]=[bo(e),bo(t)].sort((e,t)=>t-e);return(i+.05)/(s+.05)};function xo(e,t,i,s,o,a){let n=i;for(let i=0;i<40;i++){const i=mo(e,t,n);if(yo(i,s)>=o)return i;if(n+=a?2:-2,n>98||n<2)break}return mo(e,t,a?98:2)}var wo;const _o=["alarm-panel","area","button","calendar","clock","conditional","energy","entities","entity","entity-filter","gauge","glance","grid","heading","history-graph","horizontal-stack","humidifier","iframe","light","logbook","map","markdown","media-control","picture","picture-elements","picture-entity","picture-glance","plant-status","sensor","shopping-list","statistic","statistics-graph","thermostat","tile","todo-list","trend","vertical-stack","weather-forecast"],ko=[["Name","name"],["Power","power"],["Online","online"],["Room","area"]];let Ao=!1;const So=[{group:"Electrical",icon:"⊕",iconColor:"#4a9eff",iconBg:"rgba(74,158,255,0.1)",items:[{key:"power",label:"Power",unit:"W",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",defaultColor:"#fbbf24"},{key:"energy",label:"Energy (kWh)",unit:"kWh",defaultColor:"#4ade80"},{key:"frequency",label:"Frequency",unit:"Hz",defaultColor:"#34d399"},{key:"apparent_power",label:"App. Power",unit:"VA",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",defaultColor:"#818cf8"},{key:"power_factor",label:"Power Factor",unit:"%",defaultColor:"#fb923c"}]},{group:"Environmental",icon:"◌",iconColor:"#4ade80",iconBg:"rgba(74,222,128,0.1)",items:[{key:"temperature",label:"Temperature",unit:"°C",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",defaultColor:"#fde047"},{key:"co2",label:"CO₂",unit:"ppm",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",defaultColor:"#fb923c"}]},{group:"Device Info",icon:"◎",iconColor:"#a78bfa",iconBg:"rgba(167,139,250,0.1)",items:[{key:"cloud",label:"Cloud status",unit:"",defaultColor:"#7dd3fc"},{key:"rssi",label:"Wi-Fi RSSI",unit:"dBm",defaultColor:"#7dd3fc"},{key:"uptime",label:"Uptime",unit:"",defaultColor:"#86efac"},{key:"ip",label:"IP Address",unit:"",defaultColor:"#94a3b8"},{key:"ssid",label:"SSID",unit:"",defaultColor:"#94a3b8"},{key:"battery",label:"Battery",unit:"%",defaultColor:"#86efac"},{key:"fw_version",label:"Firmware",unit:"",defaultColor:"#94a3b8"},{key:"mac",label:"MAC Address",unit:"",defaultColor:"#94a3b8"}]},{group:"Alerts",icon:"⚠",iconColor:"#f87171",iconBg:"rgba(239,68,68,0.15)",items:[{key:"overtemp",label:"Overtemp",unit:"",defaultColor:"#f87171"},{key:"overpower",label:"Overpower",unit:"",defaultColor:"#f87171"},{key:"motion",label:"Motion",unit:"",defaultColor:"#f87171"},{key:"door",label:"Door / Window",unit:"",defaultColor:"#f87171"},{key:"flood",label:"Flood",unit:"",defaultColor:"#f87171"},{key:"smoke",label:"Smoke",unit:"",defaultColor:"#f87171"},{key:"vibration",label:"Vibration",unit:"",defaultColor:"#f87171"}]}],Co=[{id:"name_row",label:"Name row",sub:"Device name + status dot + primary control"},{id:"sensors",label:"Sensor chips",sub:"Power, temp, voltage, RSSI…"},{id:"graph",label:"Sparkline graph",sub:"History sparklines per selected sensor"},{id:"dimmer",label:"Dimmer / color",sub:"Brightness + color picker for lights"},{id:"cover_controls",label:"Cover controls",sub:"Open / stop / close + position"},{id:"trv_control",label:"TRV control",sub:"Thermostat display + ± buttons"},{id:"valve_controls",label:"Valve controls",sub:"Open / stop / close for valves"},{id:"input_channels",label:"Input channels",sub:"Binary input state chips (i3/i4)"},{id:"relay_channels",label:"Relay channels",sub:"Per-channel toggles for multi-relay devices"},{id:"power_bar",label:"Power bar",sub:"Mini usage bar at tile bottom"},{id:"virtual_controls",label:"Virtual controls",sub:"Script-defined switches, selectors & actions"},{id:"media_controls",label:"Media controls",sub:"the card’s own player: now playing, play/pause, volume, browse"},{id:"delegated_controls",label:"Native controls",sub:"HA’s own controls for locks, fans, vacuums — needs Native controls on"},{id:"badges",label:"Type & gen badges",sub:"Dimmer · G3 · Relay labels"}],$o=[{v:"default",label:"Default",icon:"⊟",desc:"Adaptive blocks"},{v:"power-monitor",label:"Power",icon:"⚡",desc:"Watts + sensors"},{v:"light-control",label:"Light",icon:"💡",desc:"Wheel + sliders"},{v:"climate-control",label:"Climate",icon:"🌡",desc:"Thermostat dial"},{v:"cover-control",label:"Cover",icon:"▤",desc:"Blind + buttons"},{v:"sensor-card",label:"Sensor",icon:"◎",desc:"Big value + trend"},{v:"input-control",label:"Inputs",icon:"⌨",desc:"Channel keypad"},{v:"scene-button",label:"Scene",icon:"▶",desc:"Tappable icon"}],Eo=[{v:"big-number",label:"Number",icon:"▲"},{v:"gauge",label:"Gauge",icon:"◉"},{v:"graph",label:"Graph",icon:"∿"},{v:"compact",label:"Compact",icon:"⊟"},{v:"table",label:"Table",icon:"≡"}];let To=wo=class extends de{constructor(){super(...arguments),this._tab="devices",this._newStyleName="",this._renamingStyle=null,this._advanced=!1,this._defaultsOpen=!1,this._resetArmed=!1,this._viewDeleteArmed=null,this._xcPlacement="header",this._xcRoom="",this._xcView="",this._xcAdding=!1,this._xcEditIndex=null,this._xcDraft=null,this._xcLatest=null,this._xcDraftKey=0,this._xcMode="form",this._xcFormEl=null,this._xcFormType=null,this._xcFormUnavailable=!1,this._xcPreview=null,this._xcDashboards=null,this._xcImportCards=null,this._xcImportLoading=!1,this._palettes={},this._paletteNaming=!1,this._paletteName="",this._expandedViewIds=new Set,this._openSections={rooms:!0,theme:!0,header:!0,tiles:!0,card:!1,colors:!1,typography:!1,graphtype:!0,graphcolors:!1,graphranges:!1,electrical:!0,environmental:!0,deviceinfo:!1,alerts:!1,"design-scope":!0,"design-panel":!0},this._haPickersReady=!1,this._iaAllEntities=null,this._expandedRooms=new Set,this._designScope=Zs,this._designGroupBy="room",this._designOpenGroups=new Set,this._designScopeLoaded=!1,this._changesOpen=!1,this._changesResetArmed=!1,this._selectedDeviceId=null,this._conflictsOpen=!1,this._flashControl=null,this._flashTimer=null,this._snapshots={},this._snapMenu=null,this._snapName="",this._snapMsg=null,this._helpOpen=!1,this._helpFilter="",this._helpTopic=null,this._rolled=null,this._styleClipFeedback="",this._openDiscDropdown=null,this._sciServer="",this._sciKey="",this._sciBusy=!1,this._sciError="",this._sciDone="",this._sciData=null,this._sciRoomMap={},this._sciOptRooms=!0,this._sciOptDevices=!0,this._sciOptStock=!1,this._sciOptFull=!0,this._iconPickerState=null,this._onEditorGoto=e=>{const t=e.detail;if(t?.device)return e.preventDefault(),void this._gotoDevice(t.device);t?.tab&&t.section&&t.flash&&(e.preventDefault(),this._gotoControl(t.tab,t.section,t.flash))},this._editorLayoutTimers=[],this._closeIconPicker=()=>{const e=this.renderRoot.querySelector("#ha-dd-icon-grid-popover");e&&"hidePopover"in e&&e.matches?.(":popover-open")&&e.hidePopover(),this._iconPickerState=null},this._onIconPickerOutsideClick=e=>{if(!this._iconPickerState)return;const t=e.composedPath().some(e=>e instanceof HTMLElement&&("ha-dd-icon-grid-popover"===e.id||e.classList?.contains("icon-picker-btn")));t||this._closeIconPicker()},this._wheel=null,this._closeWheel=()=>{const e=this.renderRoot.querySelector("#ha-dd-color-wheel");e?.hidePopover&&e.matches(":popover-open")&&e.hidePopover(),this._wheel=null},this._onWheelOutsideClick=e=>{if(!this._wheel)return;const t=e.composedPath().some(e=>e instanceof HTMLElement&&("ha-dd-color-wheel"===e.id||e.classList?.contains("cw-btn")));t||this._closeWheel()},this._wheelPointer=e=>{if("pointermove"===e.type&&!(1&e.buttons))return;const t=e.currentTarget;"pointerdown"===e.type&&t.setPointerCapture(e.pointerId);const i=t.getBoundingClientRect(),s=i.left+i.width/2,o=i.top+i.height/2,a=e.clientX-s,n=e.clientY-o,r=Math.min(1,Math.hypot(a,n)/(i.width/2)),l=(180*Math.atan2(a,-n)/Math.PI+360)%360;this._setWheel({h:l,s:r}),e.preventDefault()},this._emitTimer=null,this._pendingConfig=null,this._devCacheKey="",this._devCache=[],this._layDrag=null,this._layMove=null}_setXcDraft(e){this._xcDraft=e,this._xcLatest=null,this._xcDraftKey++,this._xcPreviewTimer&&(clearTimeout(this._xcPreviewTimer),this._xcPreviewTimer=void 0),this._xcPreview=e,this._ensureXcForm(e,!0)}_queueXcPreview(e){this._xcPreviewTimer&&clearTimeout(this._xcPreviewTimer),this._xcPreviewTimer=setTimeout(()=>{this._xcPreviewTimer=void 0,this._xcPreview=e},400)}setConfig(e){this._config=Si(e),this._loadAdvanced(),this._loadPalettes()}_stepTab(e){const t=uo.map(e=>e.id),i=t.indexOf(this._tab),s=t[Math.min(t.length-1,Math.max(0,(i<0?0:i)+e))];s&&s!==this._tab&&(this._tab=s,this.updateComplete.then(()=>this._scrollTabIntoView(s)))}_scrollTabIntoView(e){const t=this.renderRoot?.querySelector(`.tab[data-tab="${e}"]`);t?.scrollIntoView({inline:"nearest",block:"nearest",behavior:"smooth"})}_gotoControl(e,t,i){this._tab=e,this._defaultsOpen=!1;const s={[t]:!0};"design"===e&&t.startsWith("design-")&&this._globalSectionDescriptors()[t.slice(7)]&&(this._designScope=Zs,s["design-panel"]=!0),this._openSections={...this._openSections,...s},this._flashControl=i,this._flashTimer&&clearTimeout(this._flashTimer),this._flashTimer=window.setTimeout(()=>{this._flashControl=null,this._flashTimer=null},2400),this.updateComplete.then(()=>{this._scrollTabIntoView(e),this.renderRoot?.querySelector(`[data-ctl="${i}"]`)?.scrollIntoView({block:"center",behavior:"smooth"})})}_gotoDevice(e){this._selectedDeviceId=e,this._setDesignScope({kind:"device",id:e}),this._gotoControl("design","design-panel","design-scope")}_lsGet(e){try{const t=localStorage.getItem(e);if(null!==t)return t;const i=localStorage.getItem(`${e}:${this._config?.title??"default"}`);return null!==i&&localStorage.setItem(e,i),i}catch{return null}}_loadSnapshots(){try{const e=this._lsGet(wo.LS_SNAPSHOTS);this._snapshots=e?JSON.parse(e):{}}catch{this._snapshots={}}}_writeSnapshots(e){this._snapshots=e;try{localStorage.setItem(wo.LS_SNAPSHOTS,JSON.stringify(e))}catch{this._snapMsg="Too large for browser storage — use Export instead."}}_saveSnapshot(){const e=this._snapName.trim();if(!e)return;const t=JSON.parse(JSON.stringify(this._config)),i=JSON.stringify(t).length;this._writeSnapshots({...this._snapshots,[e]:{saved:(new Date).toISOString(),config:t}}),this._snapName="",this._snapMenu=null,this._snapMsg=i>1e6?`Saved "${e}" — it is large (${Math.round(i/1024)} KB); export it to a file to be safe.`:`Saved "${e}".`,this._clearSnapMsgSoon()}_applySnapshot(e){this._emitNow(Si(e)),this._snapMenu=null}_deleteSnapshot(e){const t={...this._snapshots};delete t[e],this._writeSnapshots(t)}_exportSnapshot(e){const t=e?this._snapshots[e]?.config:this._config;if(!t)return;const i=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=`${(e??this._config?.title??"ha-device-dashboard").replace(/[^\w.-]+/g,"-")}.json`,o.click(),URL.revokeObjectURL(s),this._snapMenu=null}async _importSnapshot(e){try{const t=JSON.parse(await e.text()),i="custom:ha-device-dashboard"===t.type?t:t.card;if("custom:ha-device-dashboard"!==i?.type)return this._snapMsg="That file is not a config for this card.",void this._clearSnapMsgSoon();this._applySnapshot(i),this._snapMsg=`Loaded ${e.name}.`,this._clearSnapMsgSoon()}catch{this._snapMsg="Could not read that file.",this._clearSnapMsgSoon()}}_clearSnapMsgSoon(){window.setTimeout(()=>{this._snapMsg=null},4e3)}_renderSnapshotControls(){const e=Object.keys(this._snapshots).sort((e,t)=>e.localeCompare(t));return q`
      <div class="snap-wrap">
        <button class="sec-toolbar-btn ${"save"===this._snapMenu?"active":""}"
          title="Save this card's whole configuration"
          @click=${()=>{this._snapMenu="save"===this._snapMenu?null:"save"}}>💾 Save</button>
        <button class="sec-toolbar-btn ${"load"===this._snapMenu?"active":""}"
          title="Restore a saved configuration"
          @click=${()=>{this._loadSnapshots(),this._snapMenu="load"===this._snapMenu?null:"load"}}>📂 Load ▾</button>

        ${"save"===this._snapMenu?q`
          <div class="snap-menu">
            <div class="snap-row">
              <input type="text" class="inline-text" style="flex:1" placeholder="Name this setup…"
                .value=${this._snapName}
                @input=${e=>{this._snapName=e.target.value}}
                @keydown=${e=>{"Enter"===e.key&&this._saveSnapshot()}}/>
              <button class="sec-toolbar-btn" @click=${()=>this._saveSnapshot()}>Save</button>
            </div>
            <button class="snap-item" @click=${()=>this._exportSnapshot()}>⭳ Export current to file…</button>
          </div>`:Y}

        ${"load"===this._snapMenu?q`
          <div class="snap-menu">
            ${e.length?e.map(e=>q`
              <div class="snap-row">
                <button class="snap-item" style="flex:1" @click=${()=>this._applySnapshot(this._snapshots[e].config)}>
                  <span class="snap-name">${e}</span>
                  <span class="snap-date">${new Date(this._snapshots[e].saved).toLocaleDateString()}</span>
                </button>
                <button class="snap-x" title="Export" @click=${()=>this._exportSnapshot(e)}>⭳</button>
                <button class="snap-x" title="Delete" @click=${()=>this._deleteSnapshot(e)}>✕</button>
              </div>`):q`<div class="snap-empty">No saved setups on this browser yet.</div>`}
            <label class="snap-item">⭱ Load from file…
              <input type="file" accept="application/json" style="display:none"
                @change=${e=>{const t=e.target.files?.[0];t&&this._importSnapshot(t)}}/>
            </label>
          </div>`:Y}
      </div>`}_helpText(e){const t=e.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);return q`${t.map(e=>e.startsWith("`")&&e.endsWith("`")?q`<code class="help-code">${e.slice(1,-1)}</code>`:e.startsWith("**")&&e.endsWith("**")?q`<b>${e.slice(2,-2)}</b>`:e)}`}_renderHelpTopic(e){const t=this._helpTopic===e.id;return q`
      <div class="help-topic ${t?"open":""}">
        <button class="help-topic-hdr" @click=${()=>{this._helpTopic=t?null:e.id}}>
          <span class="help-caret">${t?"▾":"▸"}</span>${e.title}
        </button>
        ${t?q`
          <div class="help-topic-body">
            ${e.body.map(e=>q`<p>${this._helpText(e)}</p>`)}
            ${e.steps?q`<ol>${e.steps.map(e=>q`<li>${this._helpText(e)}</li>`)}</ol>`:Y}
          </div>`:Y}
      </div>`}_renderHelpPanel(){const e=this._helpFilter.trim().toLowerCase(),t=t=>!e||t.title.toLowerCase().includes(e)||t.body.some(t=>t.toLowerCase().includes(e))||(t.steps??[]).some(t=>t.toLowerCase().includes(e)),i=go.filter(t),s=vo.filter(t);return q`
      <div class="help-panel">
        <div class="help-hdr">
          <span class="help-title">Help</span>
          <input type="text" class="inline-text help-search" placeholder="Search help…"
            .value=${this._helpFilter}
            @input=${e=>{this._helpFilter=e.target.value}}/>
          <button class="snap-x" title="Close" @click=${()=>{this._helpOpen=!1}}>✕</button>
        </div>
        <div class="help-intro">${"How the card fits together. For the exhaustive option list — every key, its scope and its default — see docs/tools/reference.html."}</div>
        ${i.length?q`
          <div class="help-group">How it works</div>
          ${i.map(e=>this._renderHelpTopic(e))}`:Y}
        ${s.length?q`
          <div class="help-group">Recipes</div>
          ${s.map(e=>this._renderHelpTopic(e))}`:Y}
        ${i.length||s.length?Y:q`<div class="snap-empty">Nothing matches “${this._helpFilter}”.</div>`}
      </div>`}_stashColours(e=wo.ROLL_SLOT){this._writePalettes({...this._palettes,[e]:this._effectivePalette()})}_rollTheme(){this._stashColours();const e=function(e){const t=Object.keys(je).filter(t=>t!==e);return t[Math.floor(Math.random()*t.length)]}(this._config.theme);this._applyTheme(e),this._rolled=`🎲 ${Ue[e]??e}`,this._clearRolledSoon()}_rollPalette(){this._stashColours();const e=function(){const e=Math.floor(360*Math.random()),t=(e+(fo(.5)?0:180))%360,i=fo(.75),s=i?mo(e,18,8):mo(e,22,96),o=i?mo(e,16,13):"#ffffff",a=i?mo(e,24,14):mo(e,30,90),n=xo(t,70,i?62:45,o,3,i);return{accent_color:n,card_bg:s,tile_bg:o,tile_border:i?mo(e,14,22):mo(e,16,84),tile_hover_bg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",tile_hover_shadow:"rgba(0,0,0,0.35)",tile_sensor_bg:i?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.04)",tile_exp_bg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",text_primary:xo(e,12,i?92:14,o,7,i),text_secondary:xo(e,10,i?72:34,o,4.5,i),text_muted:xo(e,8,i?55:48,o,3,i),header_bg:a,header_bg2:i?mo((e+20)%360,28,20):mo((e+20)%360,34,84),header_text_color:xo(e,10,i?94:12,a,7,i),header_orb_color:n,online_color:xo(140,45,i?62:36,o,3,i),offline_color:xo(8,60,i?64:46,o,3,i),power_color:xo(38,70,i?60:40,o,3,i),area_header_color:n}}();this._set("style",{...this._config.style??{},...e}),this._set("theme","custom"),this._rolled=`✨ Generated palette — accent ${e.accent_color}`,this._clearRolledSoon()}_clearRolledSoon(){window.setTimeout(()=>{this._rolled=null},5e3)}_loadPalettes(){try{const e=this._lsGet(wo.LS_PALETTES);if(e)return void(this._palettes=JSON.parse(e));const t=`shelly-dashboard:savedTheme:${this._config?.title??"default"}`,i=localStorage.getItem(t);i&&(this._palettes={Saved:JSON.parse(i)},localStorage.setItem(wo.LS_PALETTES,JSON.stringify(this._palettes)),localStorage.removeItem(t))}catch{}}_writePalettes(e){this._palettes=e;try{localStorage.setItem(wo.LS_PALETTES,JSON.stringify(e))}catch{}}_effectivePalette(){const e=this._config.style??{},t={...qe(this._config.theme)??{}};for(const i of Ge)void 0!==e[i]&&(t[i]=e[i]);return t}_savePalette(e){const t=e.trim();t&&(this._writePalettes({...this._palettes,[t]:this._effectivePalette()}),this._paletteNaming=!1,this._paletteName="",this._rolled=`Saved “${t}”.`,this._clearRolledSoon())}_deletePalette(e){const t={...this._palettes};delete t[e],this._writePalettes(t)}_loadAdvanced(){this._advanced="1"===this._lsGet(wo.LS_ADVANCED)}_setAdvanced(e){this._advanced=e;try{localStorage.setItem(wo.LS_ADVANCED,e?"1":"0")}catch{}}_adv(e){return this._advanced?e:Y}connectedCallback(){super.connectedCallback(),function(){if(Ao||"undefined"==typeof document)return;const e=Fe();if(!e)return;const t=document.createElement("link");t.rel="stylesheet",t.href=e,document.head.appendChild(t),Ao=!0}(),window.addEventListener("mousedown",this._onIconPickerOutsideClick,!0),window.addEventListener("mousedown",this._onWheelOutsideClick,!0),window.addEventListener("hdd-editor-goto",this._onEditorGoto),this._loadSnapshots(),this._ensureHaPickers(),this._editorRAF=requestAnimationFrame(()=>{const e=this.getRootNode(),t=e?.host;if(!t)return;const i=t.getRootNode(),s=i?.host;if(!s)return;const o=s.shadowRoot;if(!o)return;try{if(window.matchMedia("(min-width: 1600px)").matches){const e=s;!1===e.large&&"function"==typeof e._enlarge&&e._enlarge()}}catch{}const a="ha-device-dashboard-editor-fix";if(!o.getElementById(a)){const e=document.createElement("style");e.id=a,e.textContent="\n          @media (min-width: 1000px) {\n            div.element-editor { overflow:hidden !important; min-height:0 !important; box-sizing:border-box !important; }\n            hui-card-element-editor { display:block !important; height:100% !important; overflow:hidden !important; min-height:0 !important; box-sizing:border-box !important; }\n            div.element-preview { overflow-x:hidden !important; box-sizing:border-box !important; }\n          }\n        ",o.appendChild(e)}const n=(e,t)=>{if(e)for(const[i,s]of Object.entries(t))e.style.setProperty(i,s,"important")},r=(e,t)=>{if(e)for(const i of t)e.style.removeProperty(i)},l=()=>{const e=o.querySelector("div.content"),t=this.shadowRoot?.querySelector(".shell"),i=o.querySelector("ha-dialog-footer");if(!e||!t)return;const s=o.querySelector("div.element-editor"),a=o.querySelector("div.element-preview");if(!window.matchMedia("(min-width: 1000px)").matches){const i=["height","max-height","overflow","overflow-y","align-items","flex","min-height","box-sizing"];return r(e,i),r(s,i),r(a,i),void r(t,["height","max-height"])}const l=window.innerHeight,c=i?.offsetHeight??0,d=e.getBoundingClientRect().top,p=Math.max(300,l-d-c);n(e,{height:`${p}px`,"max-height":`${p}px`,overflow:"hidden","align-items":"stretch","box-sizing":"border-box"}),n(s,{height:`${p}px`,"max-height":`${p}px`,overflow:"hidden"}),n(a,{height:`${p}px`,"max-height":`${p}px`,"overflow-y":"auto"});const h=t.getBoundingClientRect().top,u=s?s.getBoundingClientRect().bottom:l,g=Math.max(400,u-h);t.style.height=`${g}px`,t.style.maxHeight=`${g}px`};if(l(),this._editorLayoutTimers.push(window.setTimeout(l,50),window.setTimeout(l,250),window.setTimeout(l,700)),this._editorResizeHandler=l,window.addEventListener("resize",l),"undefined"!=typeof ResizeObserver){this._editorRO=new ResizeObserver(l);const e=o.querySelector("div.element-editor");e&&this._editorRO.observe(e)}})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("mousedown",this._onIconPickerOutsideClick,!0),window.removeEventListener("mousedown",this._onWheelOutsideClick,!0),window.removeEventListener("hdd-editor-goto",this._onEditorGoto),this._flashTimer&&(clearTimeout(this._flashTimer),this._flashTimer=null),clearTimeout(this._styleClipTimer),clearTimeout(this._viewDeleteTimer),this._sciKey="",this._sciData=null,null!=this._editorRAF&&(cancelAnimationFrame(this._editorRAF),this._editorRAF=void 0),this._editorLayoutTimers.forEach(e=>clearTimeout(e)),this._editorLayoutTimers=[],this._editorResizeHandler&&(window.removeEventListener("resize",this._editorResizeHandler),this._editorResizeHandler=void 0),this._editorRO?.disconnect(),this._editorRO=void 0,this._flushConfig()}_renderIconGridPopover(){const e=this._iconPickerState,t="#f4601e";return q`
      <div popover="manual" class="icon-grid-popover" id="ha-dd-icon-grid-popover"
        @click=${e=>e.stopPropagation()}>
        ${e?bt.map(i=>{const s=(e.currentValue??"none")===i.value,o="none"!==i.value?ft[i.value]?.[e.isOn?"on":"off"]??t:t;return q`
            <button class="icon-grid-cell ${s?"sel":""}"
              style="color:${o}${s?`;background:${t}30;border-color:${t}`:""}"
              title=${i.label}
              @click=${()=>{e.onSelect("none"===i.value?void 0:i.value),this._closeIconPicker()}}>
              ${"none"===i.value?q`<span class="icon-grid-none">—</span>`:vt(i.value,e.isOn,`--ent-spd:1;color:${o};width:20px;height:20px`,"icon-preview")}
              <span class="icon-grid-lbl">${i.label}</span>
            </button>`}):Y}
      </div>`}_openWheel(e,t){const i=Ut(e),{h:s,s:o,v:a}=qt(i?.hex??"#808080");this._wheel={hex:Gt(s,o,a),h:s,s:o,v:a,alpha:i?.alpha??1,unparsed:i?void 0:e||void 0,onSelect:t},this.updateComplete.then(()=>{const e=this.renderRoot.querySelector("#ha-dd-color-wheel");if(e)try{e.showPopover&&!e.matches(":popover-open")&&e.showPopover()}catch{}})}_setWheel(e){if(!this._wheel)return;const t={...this._wheel,...e};t.hex=Gt(t.h,t.s,t.v),t.unparsed=void 0,this._wheel=t,t.onSelect(Wt(t.hex,t.alpha))}_wheelButton(e,t,i="Pick a colour"){return q`
      <button class="cw-btn" style="background:${e}" title=${i}
        @click=${i=>{i.stopPropagation(),this._openWheel(e,t)}}></button>`}_renderColorWheel(){const e=this._wheel,t=[...new Set([...wi.map(e=>e.defaultColor),"#ffffff","#e2e8f0","#94a3b8","#4b5563","#000000"])],i=e?50+50*e.s*Math.sin(e.h*Math.PI/180):50,s=e?50-50*e.s*Math.cos(e.h*Math.PI/180):50;return q`
      <div popover="manual" id="ha-dd-color-wheel" class="cw-pop" @click=${e=>e.stopPropagation()}>
        ${e?q`
          <div class="cw-disc" style="--cw-v:${e.v}"
            @pointerdown=${this._wheelPointer} @pointermove=${this._wheelPointer}>
            <div class="cw-dot" style="left:${i.toFixed(1)}%;top:${s.toFixed(1)}%;background:${e.hex}"></div>
          </div>
          ${e.unparsed?q`
            <div class="cw-note">Currently <b>${e.unparsed}</b> — picking a colour replaces it.</div>`:Y}
          <div class="cw-row">
            <span class="cw-lbl">Brightness</span>
            <input type="range" min="0" max="100" .value=${String(Math.round(100*e.v))}
              style="flex:1;accent-color:${e.hex}"
              @input=${e=>this._setWheel({v:parseInt(e.target.value,10)/100})}/>
          </div>
          <div class="cw-row">
            <span class="cw-lbl">Opacity</span>
            <input type="range" min="0" max="100" .value=${String(Math.round(100*e.alpha))}
              style="flex:1;accent-color:${e.hex}" title="Transparency of this colour"
              @input=${e=>this._setWheel({alpha:parseInt(e.target.value,10)/100})}/>
            <span class="cw-lbl" style="min-width:34px;text-align:right">${Math.round(100*e.alpha)}%</span>
          </div>
          <div class="cw-row">
            <span class="cw-swatch" style="background:${Wt(e.hex,e.alpha)}"></span>
            <input type="text" class="inline-text" style="width:90px;font-family:monospace" .value=${e.hex} maxlength="7"
              @change=${e=>{const t=e.target.value.trim();if(/^#[0-9a-f]{6}$/i.test(t)){const{h:e,s:i,v:s}=qt(t);this._setWheel({h:e,s:i,v:s})}}}/>
            <button class="color-reset" style="margin-left:auto" @click=${this._closeWheel}>Done</button>
          </div>
          <div class="cw-presets">
            ${t.map(t=>q`
              <span class="cw-preset ${t===e.hex?"on":""}" style="background:${t}" title=${t}
                @click=${()=>{const{h:e,s:i,v:s}=qt(t);this._setWheel({h:e,s:i,v:s})}}></span>`)}
          </div>`:Y}
      </div>`}_iconPicker(e,t,i){const s="#f4601e",o=e?ft[e]?.[t?"on":"off"]??s:s,a=this._iconPickerState?.onSelect===i;return q`
      <div class="icon-picker-wrap">
        <button class="icon-picker-btn compact"
          @click=${s=>{s.stopPropagation(),a?this._closeIconPicker():(this._iconPickerState={currentValue:e,isOn:t,onSelect:i},this.updateComplete.then(()=>{const e=this.renderRoot.querySelector("#ha-dd-icon-grid-popover");if(!e)return;const t=e;if("function"==typeof t.showPopover)try{t.matches?.(":popover-open")||t.showPopover()}catch{}else e.style.display="grid",e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.zIndex="99999"}))}}>
          ${e?vt(e,t,`--ent-spd:1;color:${o}`,"icon-preview-sm"):q`<span class="icon-cell-none">—</span>`}
        </button>
      </div>`}_set(e,t){if(!this._config)return;const i={...this._config,[e]:t},s="areas"===e||"sensors"===e||"graph_sensors"===e;(""===t||void 0===t||Array.isArray(t)&&0===t.length&&!s)&&delete i[e],this._emitConfig(i)}_emitConfig(e){this._config=e,this._pendingConfig=e,null!=this._emitTimer&&clearTimeout(this._emitTimer),this._emitTimer=window.setTimeout(()=>this._flushConfig(),300)}_flushConfig(){null!=this._emitTimer&&(clearTimeout(this._emitTimer),this._emitTimer=null);const e=this._pendingConfig;this._pendingConfig=null,e&&Re(this,"config-changed",{config:e})}_emitNow(e){this._config=e,this._pendingConfig=e,this._flushConfig()}_toggleSec(e){this._openSections={...this._openSections,[e]:!this._openSections[e]}}_resetBtn(e,t){return e?q`<button class="field-reset" title="Reset to default"
          @click=${e=>{e.stopPropagation(),t()}}>↺</button>`:Y}_clearCfg(e){const t={...this._config};delete t[e];const{type:i,...s}=t;this._emitNow({type:i,...s})}_clearStyle(e){const t={...this._config.style??{}};delete t[e],this._set("style",Object.keys(t).length?t:void 0)}_clearGraphStyle(e){const t={...this._config.graph_style??{}};delete t[e],this._set("graph_style",Object.keys(t).length?t:void 0)}_renderBgThumb(e){return q`<div class="bg-thumb" style="background-image:url(${e})" title="Preview"></div>`}_estimateImageSize(e){if(!e.startsWith("data:"))return"";const t=e.indexOf(",");if(t<0)return"";const i=Math.floor(.75*(e.length-t-1));return i>=1048576?`~${(i/1048576).toFixed(1)} MB`:i>=1024?`~${Math.round(i/1024)} KB`:`~${i} B`}_showStyleFeedback(e){this._styleClipFeedback=e,clearTimeout(this._styleClipTimer),this._styleClipTimer=window.setTimeout(()=>{this._styleClipFeedback=""},1500)}_getAreas(){if(!this.hass)return[];const e=new Set(this._allDevices().map(e=>(e.area??"").toLowerCase()).filter(Boolean)),t=new Set((this._config.areas??[]).map(e=>e.toLowerCase()));return Object.values(this.hass.areas??{}).map(e=>({id:e.area_id,name:e.name})).filter(i=>e.has(i.name.toLowerCase())||t.has(i.name.toLowerCase())).sort((e,t)=>e.name.localeCompare(t.name))}_allDevices(){if(!this.hass)return[];const e=this._config,t=JSON.stringify([e?.mode,e?.universal_scope,e?.include_integrations,e?.exclude_integrations,e?.include_domains,e?.exclude_domains]);return this._devCacheHass===this.hass&&this._devCacheKey===t||(this._devCache=_t(this.hass,{universal:"universal"===e?.mode,scope:e?.universal_scope,includeIntegrations:e?.include_integrations,excludeIntegrations:e?.exclude_integrations,includeDomains:e?.include_domains,excludeDomains:e?.exclude_domains}),this._devCacheHass=this.hass,this._devCacheKey=t),this._devCache}_getDiscoveredDevices(){if(!this.hass)return[];const e=this._config.areas;let t=this._allDevices();if(void 0!==e){const i=new Set(e.map(e=>e.toLowerCase()));t=t.filter(e=>i.has((e.area??"").toLowerCase()))}return t.map(e=>({device_id:e.device_id,name:e.name,area:e.area})).sort((e,t)=>e.name.localeCompare(t.name))}_setAreaStyle(e,t,i){const s={...this._config.area_styles?.[e]??{}};void 0===i||""===i?delete s[t]:s[t]=i;const o={...this._config.area_styles??{}};Object.keys(s).length?o[e]=s:delete o[e],this._set("area_styles",Object.keys(o).length?o:void 0)}_clearAreaStyle(e){const t={...this._config.area_styles??{}};delete t[e],this._set("area_styles",Object.keys(t).length?t:void 0)}_namedEntityField(e,t,i,s,o){const a=ms(e??[]);return q`
      <div class="chip-picker-ents">
        <div class="chip-picker-grp-lbl">⌗ Specific entities</div>
        ${this._entityField(a,o=>{const a=Array.isArray(o)?o:o?[o]:[],n=void 0!==e?fs(e):[...t].filter(e=>i.includes(e)),r=[...n,...a];s(r.length?r:void 0)},{deviceEntities:o??[],scopeAll:!o?.length,placeholder:"sensor.davidpc_cpuload",multi:!0,note:"For readings with no device class — CPU, memory, disk. Shown first, in the order added, and only on the device that owns them."})}
      </div>`}_selAllNone(e,t){return q`
      <span class="sel-allnone">
        <button type="button" class="sel-mini" title="Select all"
          @click=${t=>{t.stopPropagation(),e()}}>All</button>
        <button type="button" class="sel-mini" title="Deselect all"
          @click=${e=>{e.stopPropagation(),t()}}>None</button>
      </span>`}_chipPicker(e,t,i,s,o,a){const n=t??[],r=void 0!==e,l=t=>!o||o.has(t)||(e??[]).includes(t),c=So.map(e=>({...e,items:e.items.filter(e=>l(e.key))})).filter(e=>e.items.length),d=So.flatMap(e=>e.items.map(e=>e.key)).filter(l),p=new Set(r?e:n.length?n:d);return q`
      <div class="chip-picker">
        <div class="chip-picker-hdr">
          <span class="chip-picker-state">${r?"Custom selection":`Inheriting from ${i}`}</span>
          ${this._selAllNone(()=>s(ys(e??n,d)),()=>s([]))}
          ${r?q`<button class="color-reset" @click=${()=>s(void 0)}>↺ Inherit</button>`:q`<button class="color-reset" @click=${()=>s([...p])}>Customize</button>`}
        </div>
        ${this._namedEntityField(e,p,d,s,a)}
        ${c.map(t=>q`
          <div class="chip-picker-grp">
            <span class="chip-picker-grp-lbl" style="color:${t.iconColor}">${t.icon} ${t.group}</span>
            <div class="pill-grp">
              ${t.items.map(t=>q`
                <span class="pill ${p.has(t.key)?"on":""} ${r?"":"dim"}"
                  @click=${()=>(t=>{const i=r?[...e]:[...p],o=i.includes(t)?i.filter(e=>e!==t):[...i,t];s(o)})(t.key)}>${t.label}</span>`)}
            </div>
          </div>`)}
      </div>`}_clearDeviceStyle(e){const t={...this._config.device_styles??{}};delete t[e],this._set("device_styles",Object.keys(t).length?t:void 0)}async _prepareImageForEmbed(e,t={}){const i=t.maxDim??1920,s=t.targetBytes??409600,o=await createImageBitmap(e,{imageOrientation:"from-image"}),a=Math.min(1,i/Math.max(o.width,o.height)),n=Math.max(1,Math.round(o.width*a)),r=Math.max(1,Math.round(o.height*a)),l=document.createElement("canvas");l.width=n,l.height=r;const c=l.getContext("2d");if(!c)throw o.close(),new Error("canvas 2d context unavailable");c.drawImage(o,0,0,n,r),o.close();let d=.85,p=l.toDataURL("image/jpeg",d);for(;.75*p.length>s&&d>.4;)d-=.1,p=l.toDataURL("image/jpeg",d);return l.width=0,l.height=0,p}async _handleBgUpload(e,t,i){const s=e.target,o=s.files?.[0];if(o){try{t(await this._prepareImageForEmbed(o,i))}catch(e){console.warn("[editor] failed to process image",o.name,e),this._showStyleFeedback(`Couldn't process "${o.name}" — try a /local/… URL instead`)}s.value=""}}_renderBgImagePicker(e,t,i,s,o,a,n,r){const l=r?.maxDim??720,c=r?.showFit??!0;return q`
      <div class="tiles-divider">${e}</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload=${t}
            @change=${e=>this._handleBgUpload(e,e=>o(e),{maxDim:l})}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector(`input[data-upload="${t}"]`)?.click()}}>↑ Local</button>
          ${i?this._renderBgThumb(i):Y}
          ${i?.startsWith("data:")?q`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(i)}</span>`:q`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${i??""}
                @change=${e=>{const t=e.target.value.trim();o(t||void 0)}}/>`}
          ${i?q`<button class="color-reset" @click=${n}>↺</button>`:Y}
          ${this._styleClipFeedback?q`<span class="clip-feedback">${this._styleClipFeedback}</span>`:Y}
        </div>
        ${i&&c?q`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(e=>q`
              <span class="pill ${(s??"cover")===e?"on":""}"
                @click=${()=>a(e)}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
          </div>`:Y}
        ${i?r?.extra??Y:Y}
      </div>`}_handleCardBgUpload(e){return this._handleBgUpload(e,e=>this._set("card_bg_image",e))}_handleTileBgUpload(e){return this._handleBgUpload(e,e=>this._set("style",{...this._config.style??{},tile_bg_image:e}),{maxDim:720})}_sec(e,t,i,s,o,a,n){const r=this._openSections[e];return q`
      <div class="sec ${r?"open":""}">
        <div class="sec-hdr" @click=${()=>this._toggleSec(e)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style="background:${i};color:${s}">${t}</div>
            <span class="sec-title">${o}</span>
          </div>
          <div class="sec-hdr-r">${a}<span class="chev">▼</span></div>
        </div>
        <div class="sec-body">${n}</div>
      </div>`}_badge(e,t,i){return q`<span class="sec-badge" style="color:${t};background:${i}">${e}</span>`}_renderDevicesTab(){const e=this._config,t=this._getAreas(),i=e.areas,s=this._allDevices().map(e=>({device_id:e.device_id,name:e.name,area:e.area})).sort((e,t)=>e.name.localeCompare(t.name)),o=e.hidden_devices??[],a=new Map;for(const e of s){const t=e.area??"";a.has(t)||a.set(t,[]),a.get(t).push(e)}const n=(r=t.map(e=>e.name),a.has("")?[...r,""]:[...r]);var r;const l=n,c=e=>{this._set("areas",function(e,t,i){const s=new Set(void 0===t?e:t);return s.has(i)?s.delete(i):s.add(i),e.every(e=>s.has(e))?void 0:[...s]}(l,i,e))},d=void 0===i?l.length:i.length,p=this._badge(`${d} / ${l.length}`,"#4ade80","rgba(74,222,128,0.1)"),h=a.get("")?.length??0,u=q`
      <div class="rooms-toolbar">
        ${h>0?q`
          <div class="rooms-note">
            <span class="rooms-note-ico">⌂</span>
            <span>${h} device${1!==h?"s":""}
              ${1!==h?"are":"is"} not assigned to a room, so
              ${1!==h?"they":"it"} appear under a <b>No Area</b> group on
              the card. Assign areas in Home Assistant — the
              <b>Entity Manager</b> custom component has a bulk area/room tool for
              doing this across many devices at once.</span>
          </div>`:Y}
        <div class="toolbar-group">
          <span class="toolbar-lbl">Sort</span>
          ${this._pills(e.sort_by??"name",ko,e=>this._set("sort_by",e))}
        </div>
        <div class="toolbar-group">
          <span class="toolbar-lbl">Rooms</span>
          ${this._selAllNone(()=>this._set("areas",void 0),()=>this._set("areas",[]))}
        </div>
        ${this._adv(this._renderCheckDropdown("only-devices","Show only these devices",s.map(e=>({value:e.device_id,label:e.name})),e.devices??[],e=>this._set("devices",e),"Empty = every discovered device, which is the normal case. Naming devices here narrows the card to just those — the way to put this card on a dashboard for one device without hiding the other sixty. Hidden devices below still win.",{picked:"shown",none:"All devices",all:"Select all",clear:"Show all"}))}
        <div class="tog-row" style="border:none;padding:4px 0 0">
          <div class="tog-lbl">Show offline devices</div>
          <label class="sw"><input type="checkbox" .checked=${!1!==e.show_offline}
            @change=${e=>this._set("show_offline",e.target.checked)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
      </div>
      ${e.favorites?.length?(()=>{const t=wo.FAV_ROW_KEY,i=(e.favorites??[]).map(e=>s.find(t=>t.device_id===e)).filter(Boolean),a=this._expandedRooms.has(t),n=!(!e.area_styles?.Favourites||!Object.keys(e.area_styles.Favourites).length);return q`
          <div class="room-row fav-room-row">
            <span class="fav-room-star">★</span>
            <span class="room-name" style="color:var(--amber)">Favourites</span>
            <span class="room-count" style="color:var(--amber)">${i.length}</span>
            <button class="room-style-btn" title="Style Favourites →" @click=${e=>{e.stopPropagation(),this._setDesignScope({kind:"room",name:"Favourites"}),this._tab="design"}}>✎</button>
            ${n?q`<button class="room-reset-btn" title="Set Favourites style to default"
              @click=${e=>{e.stopPropagation(),this._clearAreaStyle("Favourites")}}>↺</button>`:Y}
            <button class="room-expand-btn ${a?"open":""}"
              style="color:${a?"var(--amber)":""}"
              @click=${e=>{e.stopPropagation();const i=new Set(this._expandedRooms);i.has(t)?i.delete(t):i.add(t),this._expandedRooms=i}}>▼</button>
          </div>
          ${a?q`
            <div class="room-expanded">
              ${i.length>1?q`
                <div class="room-devices-hdr">
                  <span class="room-devices-lbl">Devices</span>
                  ${this._selAllNone(()=>this._set("hidden_devices",Qs(o,i.map(e=>e.device_id),!1)),()=>this._set("hidden_devices",Qs(o,i.map(e=>e.device_id),!0)))}
                </div>`:Y}
              <div class="room-devices">
                ${i.map(t=>{const i=o.includes(t.device_id),s=!!e.device_styles?.[t.device_id],a=this._selectedDeviceId===t.device_id,n=t.area?q`<span class="fav-dev-area">${t.area}</span>`:Y;return q`
                    <div class="room-device-row ${a?"selected":""}">
                      ${n}
                      <span class="room-device-name" style="color:${i?"var(--t3)":"var(--t2)"};flex:1">${t.name}</span>
                      ${s?q`<span class="dev-style-dot"></span>`:Y}
                      <label class="sw">
                        <input type="checkbox" .checked=${!i} @change=${()=>{const e=i?o.filter(e=>e!==t.device_id):[...o,t.device_id];this._set("hidden_devices",e.length?e:void 0)}}>
                        <span class="sw-t"></span><span class="sw-b"></span>
                      </label>
                      <button class="fav-btn on" title="Remove from Favourites"
                        @click=${i=>{i.stopPropagation();const s=(e.favorites??[]).filter(e=>e!==t.device_id);this._set("favorites",s.length?s:void 0)}}>★</button>
                      ${s?q`<button class="room-reset-btn" title="Set device style to default"
                        @click=${e=>{e.stopPropagation(),this._clearDeviceStyle(t.device_id)}}>↺</button>`:Y}
                      <button class="room-style-btn" title="Style this device →" @click=${e=>{e.stopPropagation(),this._gotoDevice(t.device_id)}}>✎</button>
                    </div>`})}
              </div>
            </div>`:Y}`})():Y}
      ${n.map(t=>{const s=t||"No Room",n=a.get(t)??[],r=(e=>{return s=e,void 0===(t=i)||t.includes(s);var t,s})(t),l=this._expandedRooms.has(t),d=!(!e.area_styles?.[t]||!Object.keys(e.area_styles[t]).length);return q`
          <div class="room-row">
            <div class="room-dot" style="background:${r?"#4ade80":"var(--t3)"}"></div>
            <span class="room-name" style="color:${r?"var(--text)":"var(--t2)"}">${s}</span>
            ${n.length?q`<span class="room-count">${n.length}</span>`:Y}
            <label class="sw"><input type="checkbox" .checked=${r}
              @change=${()=>c(t)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
            ${d?q`<button class="room-reset-btn" title="Set room style to default"
              @click=${e=>{e.stopPropagation(),this._clearAreaStyle(t)}}>↺</button>`:Y}
            <button class="room-style-btn" title="Style this room →" @click=${e=>{e.stopPropagation(),this._setDesignScope({kind:"room",name:t}),this._tab="design"}}>✎</button>
            <button class="room-expand-btn ${l?"open":""}" @click=${e=>{e.stopPropagation();const i=new Set(this._expandedRooms);i.has(t)?i.delete(t):i.add(t),this._expandedRooms=i}}>▼</button>
          </div>
          ${l?q`
            <div class="room-expanded">
              <!-- Device list. ✎ jumps to Design with that device as the scope. -->
              ${n.length>1?q`
                <div class="room-devices-hdr">
                  <span class="room-devices-lbl">Devices</span>
                  ${this._selAllNone(()=>this._set("hidden_devices",Qs(o,n.map(e=>e.device_id),!1)),()=>this._set("hidden_devices",Qs(o,n.map(e=>e.device_id),!0)))}
                </div>`:Y}
              <div class="room-devices">
                ${n.length?n.map(t=>{const i=o.includes(t.device_id),s=!!e.device_styles?.[t.device_id],a=this._selectedDeviceId===t.device_id;return q`
                    <div class="room-device-row ${a?"selected":""}">
                      <span class="room-device-name" style="color:${i?"var(--t3)":"var(--t2)"}">${t.name}</span>
                      ${s?q`<span class="dev-style-dot"></span>`:Y}
                      <label class="sw">
                        <input type="checkbox" .checked=${!i} @change=${()=>{const e=i?o.filter(e=>e!==t.device_id):[...o,t.device_id];this._set("hidden_devices",e.length?e:void 0)}}>
                        <span class="sw-t"></span><span class="sw-b"></span>
                      </label>
                      <button class="fav-btn ${(e.favorites??[]).includes(t.device_id)?"on":""}"
                        title="${(e.favorites??[]).includes(t.device_id)?"Remove from Favourites":"Add to Favourites"}"
                        @click=${i=>{i.stopPropagation();const s=e.favorites??[],o=s.includes(t.device_id)?s.filter(e=>e!==t.device_id):[...s,t.device_id];this._set("favorites",o.length?o:void 0)}}>★</button>
                      ${s?q`<button class="room-reset-btn" title="Set device style to default"
                        @click=${e=>{e.stopPropagation(),this._clearDeviceStyle(t.device_id)}}>↺</button>`:Y}
                      <button class="room-style-btn" title="Style this device →" @click=${e=>{e.stopPropagation(),this._gotoDevice(t.device_id)}}>✎</button>
                    </div>`}):q`<div class="room-device-empty">No devices in this room</div>`}
              </div>
            </div>`:Y}`})}`,g=Y,v=this._globalSectionDescriptors().lights;return q`
      ${this._renderDiscoverySection()}
      ${v?this._sec("lights",v.icon,v.bg,v.fg,v.label,v.badge,v.body):Y}
      ${this._renderCloudImportSection()}
      ${this._renderExtraCardsSection()}
      ${this._sec("rooms","⌂","rgba(74,222,128,0.1)","#4ade80","Rooms & devices",p,u)}
      ${g}`}_xcKey(){return"header"===this._xcPlacement?"header_cards":"footer_cards"}_xcViewId(){return this._xcView&&(this._config.views??[]).some(e=>e.id===this._xcView)?this._xcView:""}_xcArray(){const e=this._config;if("room"===this._xcPlacement)return e.area_cards?.[this._xcRoom]??[];const t=this._xcKey(),i=this._xcViewId();if(i){const s=(this._config.views??[]).find(e=>e.id===i);return s?.[t]??e[t]??[]}return e[t]??[]}_xcSetArray(e){if("room"===this._xcPlacement){const t={...this._config.area_cards??{}};return e.length?t[this._xcRoom]=e:delete t[this._xcRoom],void this._set("area_cards",Object.keys(t).length?t:void 0)}const t=this._xcKey(),i=this._xcViewId();i?this._updateView(i,{[t]:e}):this._set(t,e.length?e:void 0)}_xcViewOverrides(){const e=this._xcViewId();if(!e||"room"===this._xcPlacement)return!1;const t=(this._config.views??[]).find(t=>t.id===e);return!!t&&void 0!==t[this._xcKey()]}_xcCancel(){this._xcAdding=!1,this._xcEditIndex=null,this._xcDraft=null,this._xcLatest=null,this._xcImportCards=null,this._xcImportLoading=!1,this._xcPreviewTimer&&(clearTimeout(this._xcPreviewTimer),this._xcPreviewTimer=void 0),this._xcPreview=null,this._xcFormEl=null,this._xcFormType=null,this._xcFormUnavailable=!1}updated(){const e=this._xcFormEl;e&&this.hass&&(e.hass=this.hass)}async _xcLoadDashboards(){if(!this._xcDashboards)try{const e=await this.hass.callWS({type:"lovelace/dashboards/list"});this._xcDashboards=(e??[]).filter(e=>"storage"===e.mode).map(e=>({url_path:e.url_path,title:e.title}))}catch{this._xcDashboards=[]}}async _xcLoadCardsFrom(e){if("__none__"!==e){this._xcImportLoading=!0,this._xcImportCards=null;try{const t=await this.hass.callWS(e?{type:"lovelace/config",url_path:e}:{type:"lovelace/config"});this._xcImportCards=this._collectCards(t)}catch{this._xcImportCards=[]}this._xcImportLoading=!1}else this._xcImportCards=null}_collectCards(e){const t=[],i=e=>{const t=Array.isArray(e.entities)?e.entities[0]:void 0,i=[e.name,e.title,e.entity,e.camera_entity,t,e.content];for(const e of i){if("string"==typeof e&&e.trim())return` · ${e.replace(/\s+/g," ").slice(0,34)}`;if(e&&"object"==typeof e&&"string"==typeof e.entity)return` · ${e.entity.slice(0,34)}`}return""},s=e=>{if(!e||"object"!=typeof e)return;const o=e;"string"==typeof o.type&&t.push({config:o,label:`${o.type}${i(o)}`});for(const e of["cards","card"]){const t=o[e];Array.isArray(t)?t.forEach(s):t&&"object"==typeof t&&s(t)}};for(const t of e.views??[]){for(const e of t.cards??[])s(e);for(const e of t.sections??[])for(const t of e.cards??[])s(t)}return t}_xcCommit(){const e=this._xcLatest??this._xcDraft;if(!e||!e.type)return;const t=this._xcArray().slice();null!==this._xcEditIndex?t[this._xcEditIndex]=e:t.push(e),this._xcSetArray(t),this._xcCancel()}_cardTypeOptions(){const e=wo._realCardTypes??_o,t=e=>e.replace(/(?:^|-)(\w)/g,(e,t,i)=>(i?" ":"")+t.toUpperCase()),i=[...e].sort().map(e=>({value:e,label:t(e)})),s=window.customCards??[];for(const e of s)i.push({value:`custom:${e.type}`,label:`${e.name||e.type} (custom)`});return i}async _probeCardTypes(){const e=wo;if(e._realCardTypes)return;e._cardTypeProbe||(e._cardTypeProbe=(async()=>{const t=e=>!!customElements.get(`hui-${e}-card`),i=()=>_o.filter(t);let s=!1;try{const e=window.loadCardHelpers,o=e?await e():null;if(o){for(const e of _o)if(!t(e))try{o.createCardElement({type:e})}catch{}let e=0,a=-1;for(let t=0;t<20&&e<2;t++){await new Promise(e=>setTimeout(e,150));const t=i().length;e=t===a?e+1:0,a=t}s=e>=2}}catch{}const o=i();e._realCardTypes=s&&o.length?o:null,e._realCardTypes||(e._cardTypeProbe=null)})());const t=e._cardTypeProbe;await t,this.requestUpdate()}async _sciFetch(){const e=no(this._sciServer);if(e)if(this._sciKey.trim()){this._sciBusy=!0,this._sciError="",this._sciDone="",this._sciData=null;try{const t=await async function(e,t){let i,s;try{i=await fetch(`${e}/interface/device/get_all_lists`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`auth_key=${encodeURIComponent(t)}`})}catch{throw new Error("Could not reach the Shelly Cloud server — check the server address.")}try{s=await i.json()}catch{throw new Error("The Shelly Cloud server sent an unexpected reply.")}if(!i.ok||!0!==s?.isok){const e=s?.errors?Object.values(s.errors).join(" "):`HTTP ${i.status}`;throw new Error(`Shelly Cloud refused the request: ${e}`)}const o=s?.data?.rooms,a=s?.data?.devices;if("object"!=typeof o||"object"!=typeof a||null===o||null===a)throw new Error("Shelly Cloud answered without room/device lists — the API may have changed.");return{rooms:Object.values(o).filter(e=>e&&"number"==typeof e.id),devices:Object.values(a).filter(e=>e&&"string"==typeof e.id)}}(e,this._sciKey.trim());this._sciKey="",this._sciData=t;const i=function(e,t){const i=new Map(t.map(e=>[po(e),e]));return new Map(e.map(e=>[e.id,i.get(po(e.name??""))]))}(t.rooms,this._getAreas().map(e=>e.name)),s={};for(const e of t.rooms)s[e.id]=i.get(e.id)??"";this._sciRoomMap=s}catch(e){this._sciError=e instanceof Error?e.message:String(e)}finally{this._sciBusy=!1}}else this._sciError="Paste your authorization cloud key first.";else this._sciError="That does not look like a server address — e.g. shelly-59-eu.shelly.cloud"}_sciApply(){const e=this._sciData,t=no(this._sciServer);if(!e||!t||!this._config)return;let i=0,s=0;const o={...this._config};if(this._sciOptRooms){const s={...this._config.area_styles??{}};for(const o of e.rooms){const e=this._sciRoomMap[o.id];if(!e||!o.image)continue;if(!this._sciOptStock&&lo(o.image))continue;const a=ro(o.image,t,this._sciOptFull);a&&(s[e]={...s[e]??{},bg_image:a,bg_image_mode:s[e]?.bg_image_mode??"ambient"},i++)}Object.keys(s).length&&(o.area_styles=s)}if(this._sciOptDevices){const i=Object.values(this.hass?.devices??{}),a=ho(e.devices,i),n={...this._config.device_styles??{}};for(const i of e.devices){const e=co(i.id);if(!e||!i.image)continue;const o=ro(i.image,t),r=a.get(e);if(o&&r){for(const e of r)n[e]={...n[e]??{},bg_image:o,bg_image_size:n[e]?.bg_image_size??"contain"};s++}}Object.keys(n).length&&(o.device_styles=n)}this._emitConfig(o),this._sciDone=`Imported ${i} room photo${1===i?"":"s"} and product images for ${s} device${1===s?"":"s"}.`,this._sciKey="",this._sciData=null}_renderCloudImportSection(){const e=this._sciData,t=this._getAreas().map(e=>e.name),i=Object.values(this.hass?.devices??{}),s=e?ho(e.devices,i).size:0,o=e?e.rooms.filter(e=>e.image&&!lo(e.image)).length:0,a=q`
      <div class="dp-hint-inline">Pull your Shelly app setup into this card: each room's photo and the official
        product image for every device. Find both fields at <b>control.shelly.cloud → user settings →
        Authorization cloud key</b>. The key is sent once, directly to Shelly over HTTPS, then wiped —
        it is never saved to the config or anywhere else.</div>
      <div class="field">
        <div class="field-lbl">Cloud server</div>
        <input type="text" class="inline-text" placeholder="shelly-59-eu.shelly.cloud"
          .value=${this._sciServer} @input=${e=>{this._sciServer=e.target.value}}>
      </div>
      <div class="field">
        <div class="field-lbl">Authorization cloud key</div>
        <input type="password" class="inline-text" placeholder="Paste the key…" autocomplete="new-password"
          .value=${this._sciKey} @input=${e=>{this._sciKey=e.target.value}}>
      </div>
      <button class="btn-copy" ?disabled=${this._sciBusy} @click=${()=>this._sciFetch()}>
        ${this._sciBusy?"Fetching…":"☁ Fetch my Shelly setup"}</button>
      ${this._sciError?q`<div class="input-err">${this._sciError}</div>`:Y}
      ${this._sciDone?q`<div class="dp-hint-inline">✓ ${this._sciDone}</div>`:Y}

      ${e?q`
        <div class="dp-hint-inline" style="margin-top:8px">Found <b>${e.rooms.length}</b> rooms
          (${o} with a custom photo) and <b>${e.devices.length}</b> devices,
          <b>${s}</b> of them matched to Home Assistant devices. Pair each cloud room
          with a room here — unmatched ones are skipped.</div>
        ${e.rooms.map(e=>q`
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <span style="flex:1;min-width:0">${e.name}
              ${e.image&&!lo(e.image)?" 📷":""}</span>
            <select class="inline-text" style="flex:1"
              .value=${this._sciRoomMap[e.id]??""}
              @change=${t=>{this._sciRoomMap={...this._sciRoomMap,[e.id]:t.target.value}}}>
              <option value="">— skip —</option>
              ${t.map(t=>q`<option value=${t} ?selected=${this._sciRoomMap[e.id]===t}>${t}</option>`)}
            </select>
          </div>`)}
        ${[["Room photos",this._sciOptRooms,e=>{this._sciOptRooms=e}],["Include Shelly's generic stock room images",this._sciOptStock,e=>{this._sciOptStock=e}],["Official product image on every device tile",this._sciOptDevices,e=>{this._sciOptDevices=e}],["Full-size photos (thumbnails when off)",this._sciOptFull,e=>{this._sciOptFull=e}]].map(([e,t,i])=>q`
          <div class="tog-row" style="border:none;padding:4px 0 0">
            <div class="tog-lbl">${e}</div>
            <label class="sw"><input type="checkbox" .checked=${t}
              @change=${e=>i(e.target.checked)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`)}
        <div class="dp-hint-inline">Images stay hosted on Shelly's cloud — nothing is copied into the config.
          A custom room photo's URL is unlisted but not private: anyone with the exact link can view it.</div>
        <button class="btn-copy" @click=${()=>this._sciApply()}>⤵ Apply to this card</button>
      `:Y}`;return this._sec("cloud-import","☁","rgba(62,161,245,0.12)","#3ea1f5","Import from Shelly Cloud",this._sciDone?this._badge("imported","#3ea1f5","rgba(62,161,245,0.12)"):Y,a)}_renderXcPreview(){const e=this._xcPreview,t=e&&"string"==typeof e.type?e.type:"",i=this._xcViewId(),s=i?(this._config.views??[]).find(e=>e.id===i):void 0,o="match"===Zi(this._config,s);return q`
      <div class="field-lbl" style="margin-top:10px">Preview</div>
      <div class="xc-preview ${o?"xc-match":""}"
        style=${ke(o?this._xcPreviewVars():{})}>
        ${t?q`<hdd-card .hass=${this.hass} .config=${e} preview></hdd-card>`:q`<div class="dp-hint-inline" style="margin:0">
              Give the card a <code>type:</code> to see it here.</div>`}
      </div>
      ${o?q`
        <div class="dp-hint-inline">Shown in this card's palette, because Look is set to Match this card.</div>`:Y}`}_xcPreviewVars(){const e=this._effectivePalette(),t=this._config.style??{},i={},s=(e,t)=>{null!=t&&""!==t&&(i[e]=String(t))};return s("--sc-tile-bg",e.tile_bg),s("--sc-tile-border",e.tile_border),s("--sc-text-primary",e.text_primary),s("--sc-text-secondary",e.text_secondary),s("--sc-text-muted",e.text_muted),s("--sc-accent",e.accent_color),null!=t.tile_radius&&s("--tile-radius",`${t.tile_radius}px`),null!=t.tile_border_width&&s("--sc-tile-border-width",`${t.tile_border_width}px`),s("--sc-font-family",t.font_family),i}async _ensureXcForm(e,t=!1){const i="string"==typeof e?.type?e.type:"";if(!t&&this._xcFormType===i&&this._xcFormEl)return;if(this._xcFormType=i,this._xcFormEl=null,this._xcFormUnavailable=!1,!i)return;const s=i.startsWith("custom:")?i.slice(7):`hui-${i}-card`;try{if(!customElements.get(s)){const e=window.loadCardHelpers,t=e?await e():null;try{t?.createCardElement({type:i})}catch{}await Promise.race([customElements.whenDefined(s),new Promise(e=>setTimeout(e,1500))])}const t=customElements.get(s);if(!t?.getConfigElement)return void(this._xcFormUnavailable=!0);const o=await t.getConfigElement();if(this._xcFormType!==i)return;o.hass=this.hass,o.setConfig(e),this._xcFormEl=o}catch{this._xcFormUnavailable=!0,this._xcFormEl=null}}_setXcMode(e){if(this._xcMode===e&&("form"!==e||this._xcFormEl))return;const t=this._xcLatest??this._xcDraft;this._xcMode=e,"yaml"===e?t&&(this._xcDraft=t,this._xcDraftKey++):this._ensureXcForm(t,!0)}_xcMove(e,t){const i=this._xcArray().slice(),s=e+t;s<0||s>=i.length||([i[e],i[s]]=[i[s],i[e]],this._xcSetArray(i))}_renderExtraCardsSection(){const e=this._xcArray(),t=this._getAreas().map(e=>e.name),i=this._config.views??[],s=!!customElements.get("ha-yaml-editor"),o=(this._xcLatest??this._xcDraft)?.type,a=q`
      <div class="field">
        <div class="field-lbl">Placement</div>
        <div class="pill-grp">
          ${["header","footer","room"].map(e=>q`
            <span class="pill ${this._xcPlacement===e?"on":""}"
              @click=${()=>{this._xcPlacement=e,this._xcCancel(),"room"===e&&!this._xcRoom&&t.length&&(this._xcRoom=t[0])}}>
              ${"header"===e?"Header (top)":"footer"===e?"Footer (bottom)":"Room"}</span>`)}
        </div>
        <div class="dp-hint-inline">Header/footer cards frame the whole dashboard; room cards sit inside one room, above its tiles.</div>
      </div>
      <div class="field">
        <div class="field-lbl">Look</div>
        ${this._pills(this._config.extra_card_style??"ha",[["Home Assistant theme","ha"],["Match this card","match"]],e=>this._set("extra_card_style","ha"===e?void 0:e))}
        <div class="dp-hint-inline">
          ${"ha"===(this._config.extra_card_style??"ha")?"Embedded cards look the way they would on a normal dashboard.":"Embedded cards take this card's background, border, radius, text and accent, so they sit in the dashboard rather than on top of it. A card that hard-codes its own colours keeps them."}
          Applies to header, footer and room cards alike.
        </div>
      </div>
      ${"room"===this._xcPlacement?q`
        <div class="field">
          <div class="field-lbl">Room</div>
          <select @change=${e=>{this._xcRoom=e.target.value,this._xcCancel()}}>
            ${t.map(e=>q`<option value=${e} ?selected=${e===this._xcRoom}>${e}</option>`)}
          </select>
        </div>
        <div class="field">
          <div class="field-lbl">Where in the room</div>
          ${this._pills(this._config.area_card_placement??"above",[["Above the tiles","above"],["Among the tiles","grid"]],e=>this._set("area_card_placement","above"===e?void 0:e))}
          <div class="dp-hint-inline">
            ${"above"===(this._config.area_card_placement??"above")?"A full-width strip over the room's tiles.":"Each card takes a tile's place in the grid, so it reads as one more thing in the room. Here a card's grid_options.columns counts tiles, not twelfths; \"full\" spans the row."}
            Applies to every room.
          </div>
        </div>`:i.length?q`
        <div class="field">
          <div class="field-lbl">Applies to</div>
          <select @change=${e=>{this._xcView=e.target.value,this._xcCancel()}}>
            <option value="" ?selected=${!this._xcViewId()}>Every view</option>
            ${i.map(e=>q`
              <option value=${e.id} ?selected=${e.id===this._xcViewId()}>
                ${e.name||e.id}${void 0!==e[this._xcKey()]?" ✓":""}
              </option>`)}
          </select>
          <div class="dp-hint-inline">
            ${this._xcViewId()?this._xcViewOverrides()?q`This view has its own list, replacing the card-wide one. An empty list here means no
                    ${this._xcPlacement} cards on this view.
                    <button class="xc-btn" style="margin-left:6px" @click=${()=>{this._updateView(this._xcViewId(),{[this._xcKey()]:void 0}),this._xcCancel()}}>Use the card-wide list</button>`:"Showing the card-wide list, which is what renders here. Adding, editing or reordering from this view gives it a list of its own, replacing the card-wide one.":"The list every view falls back to."}
          </div>
        </div>`:Y}
      <div class="xc-list">
        ${e.length?e.map((t,i)=>q`
          <div class="xc-row">
            <span class="xc-type">${t.type??"?"}</span>
            <button class="xc-btn" ?disabled=${0===i} title="Move up"
              @click=${()=>this._xcMove(i,-1)}>▲</button>
            <button class="xc-btn" ?disabled=${i===e.length-1} title="Move down"
              @click=${()=>this._xcMove(i,1)}>▼</button>
            <button class="xc-btn" @click=${()=>{this._xcEditIndex=i,this._xcAdding=!1,this._setXcDraft({...t})}}>Edit</button>
            <button class="xc-btn xc-del" @click=${()=>{const t=e.slice();t.splice(i,1),this._xcSetArray(t)}}>✕</button>
          </div>`):q`<div class="dp-hint-inline">No cards here yet.</div>`}
      </div>
      ${this._xcAdding||null!==this._xcEditIndex?Y:q`
        <button class="sec-toolbar-btn" @click=${()=>{this._xcAdding=!0,this._xcLoadDashboards(),this._probeCardTypes(),this._setXcDraft({})}}>+ Add card</button>`}
      ${this._xcAdding?q`
        <div class="field">
          <div class="field-lbl">Copy from a dashboard</div>
          <select @change=${e=>this._xcLoadCardsFrom(e.target.value)}>
            <option value="__none__">— choose a dashboard —</option>
            ${(this._xcDashboards??[]).map(e=>q`<option value=${e.url_path}>${e.title}</option>`)}
          </select>
          ${this._xcImportLoading?q`<div class="dp-hint-inline">Loading cards…</div>`:Y}
          ${this._xcImportCards?this._xcImportCards.length?q`
            <div class="xc-import-list">
              ${this._xcImportCards.map(e=>q`
                <button class="xc-import-row" title="Use this card" @click=${()=>this._setXcDraft({...e.config})}>${e.label}</button>`)}
            </div>`:q`<div class="dp-hint-inline">No cards found on that dashboard.</div>`:Y}
        </div>
        <div class="field">
          <div class="field-lbl">Or start from a card type</div>
          <select @change=${e=>{const t=e.target.value;this._setXcDraft(t?{type:t}:{})}}>
            <option value="">— none, paste YAML below —</option>
            ${this._cardTypeOptions().map(e=>q`<option value=${e.value}>${e.label}</option>`)}
          </select>
          <div class="dp-hint-inline">Copy a card from another dashboard above, pick a type, or paste a card's full YAML below (with its own <code>type:</code>).</div>
        </div>`:Y}
      ${this._xcDraft?q`
        <div class="field">
          <div class="xc-mode-row">
            <div class="field-lbl" style="margin:0">Card configuration</div>
            ${this._pills(this._xcFormEl?this._xcMode:"yaml",[["Form","form"],["YAML","yaml"]],e=>this._setXcMode(e))}
          </div>
          ${"form"===this._xcMode&&this._xcFormEl?q`
            <!-- The boundary. A card editor's config-changed bubbles all the way
                 to Home Assistant's edit-card dialog, which reads it as an edit
                 to OUR card and replaces this editor with its own. Catching it
                 here is what makes embedding a form editor possible at all. -->
            <div class="xc-form"
              @config-changed=${e=>{e.stopPropagation();const t=e.detail?.config;t&&(this._xcLatest=t,this._queueXcPreview(t))}}
              @GUImode-changed=${e=>e.stopPropagation()}
              @edit-detail-element=${e=>e.stopPropagation()}>
              ${this._xcFormEl}
            </div>`:Y}
          ${"form"!==this._xcMode||this._xcFormEl?Y:q`
            <div class="dp-hint-inline">
              ${o?this._xcFormUnavailable?"This card ships no visual editor, so YAML it is.":"Loading the card's editor…":"Pick a card type above, and its own editor appears here."}
            </div>`}
          ${"yaml"!==this._xcMode&&this._xcFormEl?Y:q`
          ${Xs(this._xcDraftKey,s?q`
            <ha-yaml-editor .hass=${this.hass} .defaultValue=${this._xcDraft}
              @value-changed=${e=>{e.stopPropagation(),!1!==e.detail?.isValid&&(this._xcLatest=e.detail.value,this._queueXcPreview(e.detail.value))}}></ha-yaml-editor>`:q`
            <textarea class="xc-yaml" .value=${JSON.stringify(this._xcDraft,null,2)}
              @input=${e=>{try{const t=JSON.parse(e.target.value);this._xcLatest=t,this._queueXcPreview(t)}catch{}}}></textarea>`)}`}
          ${this._renderXcPreview()}
          <div class="xc-actions">
            <button class="sec-toolbar-btn" @click=${()=>this._xcCommit()}>${null!==this._xcEditIndex?"Save":"Add"}</button>
            <button class="sec-toolbar-btn" @click=${()=>this._xcCancel()}>Cancel</button>
          </div>
        </div>`:Y}`,n=e.length?this._badge(String(e.length),"#8aa0ff","rgba(120,140,255,0.12)"):Y;return this._sec("extra-cards","▤","rgba(120,140,255,0.12)","#8aa0ff","Extra cards",n,a)}_renderCheckDropdown(e,t,i,s,o,a,n={picked:"hidden",none:"None hidden",all:"Hide all",clear:"Clear"}){const r=this._openDiscDropdown===e,l=new Set(s),c=l.size;return q`
      <div class="field">
        <div class="field-lbl">${t}</div>
        <button class="check-dd-btn ${r?"open":""}"
          @click=${()=>{this._openDiscDropdown=r?null:e}}>
          <span>${c?`${c} ${n.picked}`:n.none}</span><span class="check-dd-caret">▾</span>
        </button>
        ${r?q`
          <div class="check-dd-panel">
            ${i.length?q`
              <div class="check-dd-head">
                <span class="check-dd-count">${c} of ${i.length} ${n.picked}</span>
                <span class="sel-allnone">
                  <button type="button" class="sel-mini"
                    @click=${()=>o(i.map(e=>e.value))}>${n.all}</button>
                  <button type="button" class="sel-mini"
                    @click=${()=>o(void 0)}>${n.clear}</button>
                </span>
              </div>`:Y}
            ${i.length?i.map(e=>q`
              <label class="check-dd-row">
                <input type="checkbox" .checked=${l.has(e.value)}
                  @change=${()=>(e=>{const t=l.has(e)?s.filter(t=>t!==e):[...s,e];o(t.length?t:void 0)})(e.value)}>
                <span>${e.label}</span>
              </label>`):q`<div class="check-dd-empty">Nothing discovered.</div>`}
          </div>`:Y}
        <div class="dp-hint-inline">${a}</div>
      </div>`}_renderEnergyPeriodPicker(e,t,i=!1){const s=i?[["Inherit",void 0],["Total","total"],["Today","today"],["Week","week"],["Month","month"]]:[["Total","total"],["Today","today"],["Week","week"],["Month","month"]];return this._pills(e??(i?void 0:"total"),s,t)}_pills(e,t,i){return q`
      <div class="pill-grp">
        ${t.map(([t,s])=>q`
          <span class="pill ${e===s?"on":""}" @click=${()=>i(s)}>${t}</span>`)}
      </div>`}_renderDiscoverySection(){const e=this._config,t="universal"===e.mode,i=e.universal_scope??"devices",s=this.hass?oi(this.hass):{integrations:[],domains:[]},o=q`
      <div class="field">
        <div class="field-lbl">Discovery mode</div>
        <div class="pill-grp">
          <span class="pill ${t?"":"on"}" @click=${()=>this._set("mode",void 0)}>Shelly only</span>
          <span class="pill ${t?"on":""}" @click=${()=>this._set("mode","universal")}>Universal</span>
        </div>
        <div class="dp-hint-inline">Shelly only discovers Shelly + BTHome devices (the original behaviour). Universal discovers every device in Home Assistant — Shelly devices keep their full-fidelity detection.</div>
      </div>
      ${t?q`
        <div class="field">
          <div class="field-lbl">Scope</div>
          <div class="pill-grp">
            ${["devices","controllable","all"].map((e,t)=>q`
              <span class="pill ${i===e?"on":""}"
                @click=${()=>this._set("universal_scope","devices"===e?void 0:e)}>
                ${["Real devices","Controllable","Everything"][t]}</span>`)}
          </div>
          <div class="dp-hint-inline">Real devices = things you can control plus real sensors (drops routers, PCs, phones). Controllable = only devices with controls. Everything = every discovered device.</div>
        </div>
        ${this._renderCheckDropdown("disc-int","Hide integrations",s.integrations.map(e=>({value:e,label:si(e)})),e.exclude_integrations??[],e=>this._set("exclude_integrations",e),"Tick the integrations to drop. The built-in list (phones, browsers, routers…) is always hidden on top of these.")}
        ${this._renderCheckDropdown("disc-dom","Hide entity types",s.domains.map(e=>({value:e,label:e})),e.exclude_domains??[],e=>this._set("exclude_domains",e),"Tick the entity domains to drop entirely (e.g. update, camera).")}
      `:Y}`,a=this._badge(t?"Universal":"Shelly",t?"#c98a63":"#4ade80",t?"rgba(201,138,99,0.12)":"rgba(74,222,128,0.1)");return this._sec("discovery","◎","rgba(201,138,99,0.12)","#c98a63","Discovery",a,o)}_setDeviceStyle(e,t){const i={...this._config.device_styles?.[e]??{},...t};void 0===i.energy_period&&delete i.energy_period,void 0===i.energy_entity&&delete i.energy_entity,void 0===i.bg_image&&delete i.bg_image,void 0===i.bg_image_size&&delete i.bg_image_size,void 0===i.color&&delete i.color,void 0===i.tile_layout&&delete i.tile_layout,void 0===i.profile&&delete i.profile,void 0===i.tile_style&&delete i.tile_style,void 0===i.power_monitor_variant&&delete i.power_monitor_variant,void 0===i.tile_icon&&delete i.tile_icon,void 0===i.tile_icon_off&&delete i.tile_icon_off,void 0===i.tile_icon_speed&&delete i.tile_icon_speed,void 0===i.tile_icon_size&&delete i.tile_icon_size,void 0===i.entity_animations&&delete i.entity_animations,void 0===i.input_actions&&delete i.input_actions,void 0===i.extra_sensors&&delete i.extra_sensors,void 0===i.sensors&&delete i.sensors,void 0===i.show_graphs&&delete i.show_graphs,void 0===i.elements&&delete i.elements,void 0===i.confirm_off&&delete i.confirm_off;const s={...this._config.device_styles??{},[e]:i};Object.keys(i).length||delete s[e],this._set("device_styles",Object.keys(s).length?s:void 0)}_setProfileStyle(e,t){const i={...this._config.profile_styles?.[e]??{},...t};for(const e of["color","tile_layout","tile_style","power_monitor_variant","sensors","show_graphs","elements"])void 0===i[e]&&delete i[e];const s={...this._config.profile_styles??{},[e]:i};Object.keys(i).length||delete s[e],this._set("profile_styles",Object.keys(s).length?s:void 0)}_styleSlug(e){const t=e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"style",i=this._config.custom_styles??{};if(!i[t])return t;let s=2;for(;i[`${t}-${s}`];)s++;return`${t}-${s}`}_saveAsStyle(e,t,i){const s=this._newStyleName.trim();if(!s)return;const o=this._styleSlug(s),a=e.tile_style,n={label:s,base:"string"==typeof a&&a.startsWith("custom:")?this._config.custom_styles?.[a.slice(7)]?.base??t:a??t};e.power_monitor_variant&&(n.variant=e.power_monitor_variant),e.elements&&(n.elements={...e.elements}),e.sensors&&(n.sensors=[...e.sensors]),e.tile_layout&&(n.tile_layout=e.tile_layout.map(e=>Array.isArray(e)?[...e]:e)),this._set("custom_styles",{...this._config.custom_styles??{},[o]:n}),i(`custom:${o}`),this._newStyleName=""}_saveDeviceAsStyle(e){const t=this._allDevices().find(t=>t.device_id===e),i=t?ei(t):null,s=(this._config.smart_tile_styles&&i&&t?zt(i.type,t):void 0)??"default";this._saveAsStyle(this._config.device_styles?.[e]??{},s,t=>this._setDeviceStyle(e,{tile_style:t}))}_saveProfileAsStyle(e){const t=Ot[e]??"default";this._saveAsStyle(this._config.profile_styles?.[e]??{},t,t=>this._setProfileStyle(e,{tile_style:t}))}_renameCustomStyle(e,t){const i=t.trim(),s=this._config.custom_styles?.[e];this._renamingStyle=null,s&&i&&i!==s.label&&this._set("custom_styles",{...this._config.custom_styles??{},[e]:{...s,label:i}})}_deleteCustomStyle(e){const t=`custom:${e}`,i={...this._config.custom_styles??{}};delete i[e],this._set("custom_styles",Object.keys(i).length?i:void 0);const s=e=>{if(!e||!Object.values(e).some(e=>e.tile_style===t))return null;const i={};for(const[s,o]of Object.entries(e)){const e={...o};e.tile_style===t&&delete e.tile_style,Object.keys(e).length&&(i[s]=e)}return Object.keys(i).length?i:void 0},o=s(this._config.device_styles);null!==o&&this._set("device_styles",o);const a=s(this._config.profile_styles);null!==a&&this._set("profile_styles",a);const n=s(this._config.area_styles);null!==n&&this._set("area_styles",n),this._config.views?.some(e=>e.tile_style===t)&&this._set("views",this._config.views.map(e=>{if(e.tile_style!==t)return e;const i={...e};return delete i.tile_style,i})),this._config.tile_style===t&&this._set("tile_style",void 0),this._flushConfig()}_renderTileStylePicker(e,t,i,s,o,a,n){const r=e??"default",l="power-monitor"===r||!e&&"power-monitor"===i,c=l&&!!n,d=[{k:"circles",label:"◉ Circles",on:"gauge"===t&&!0!==a},{k:"graphs",label:"∿ Graphs",on:"graph"===t},{k:"both",label:"◉∿ Both",on:"gauge"===t&&!0===a}],p=c?Eo.filter(e=>"gauge"!==e.v&&"graph"!==e.v):Eo;return q`
      <div class="ts-style-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        ${$o.map(e=>q`
          <button class="ts-style-btn ${r===e.v?"on":""}"
            @click=${()=>s("default"===e.v?void 0:e.v)}>
            <span class="ts-style-icon">${e.icon}</span>
            <span class="ts-style-label">${e.label}</span>
            <span class="ts-style-desc">${e.desc}</span>
          </button>`)}
      </div>
      ${(()=>{const t=Object.entries(this._config.custom_styles??{});return t.length?q`
          <div class="field-lbl" style="margin-top:8px">Saved styles</div>
          <div class="pill-grp">
            ${t.map(([t,i])=>{const o=`custom:${t}`;return this._renamingStyle===t?q`<input type="text" class="inline-text" style="width:9em"
                  .value=${i.label||t}
                  @click=${e=>e.stopPropagation()}
                  @blur=${e=>this._renameCustomStyle(t,e.target.value)}
                  @keydown=${e=>{"Enter"===e.key&&this._renameCustomStyle(t,e.target.value),"Escape"===e.key&&(e.target.value=i.label||t,this._renamingStyle=null)}}
                  @focus=${e=>e.target.select()}
                  ${Ks(e=>e?.focus())}/>`:q`<span class="pill ${e===o?"on":""}" @click=${()=>s(o)}>
                ${i.label||t}
                <span title="Rename style" style="margin-left:6px;cursor:pointer;opacity:.7"
                  @click=${e=>{e.stopPropagation(),this._renamingStyle=t}}>✎</span>
                <span title="Delete style" style="margin-left:4px;cursor:pointer;opacity:.7"
                  @click=${e=>{e.stopPropagation(),this._deleteCustomStyle(t)}}>×</span>
              </span>`})}
          </div>`:Y})()}
      ${c?q`
        <div class="field-lbl" style="margin-top:8px">Display</div>
        <div class="pill-grp">
          ${d.map(e=>q`
            <span class="pill ${e.on?"on":""}" @click=${()=>(e=>{"circles"===e?(o("gauge"),n(!1)):"graphs"===e?(o("graph"),n(void 0)):(o("gauge"),n(!0))})(e.k)}>${e.label}</span>`)}
        </div>
        <div class="hint" style="margin-top:2px">Circles = arc gauges · Graphs = sparklines · Both = arcs with sparklines below</div>`:Y}
      ${l?q`
        <div class="field-lbl" style="margin-top:8px">${c?"More layouts":"Power monitor variant"}</div>
        <div class="pill-grp">
          ${p.map(e=>q`
            <span class="pill ${t===e.v?"on":""}"
              @click=${()=>o("big-number"===e.v?void 0:e.v)}>
              ${e.icon} ${e.label}
            </span>`)}
        </div>`:Y}`}_blockPreview(e,t){switch(e){case"name_row":return q`<div class="tp-row tp-name-row"><div class="tp-dot" style="background:#4ade80"></div><span class="tp-tog" style="background:${t}">ON</span><span class="tp-name">Ceiling light</span></div>`;case"sensors":return q`<div class="tp-row tp-chips"><span class="tp-chip">4.1 W</span><span class="tp-chip">235 V</span><span class="tp-chip">44.6 °C</span><span class="tp-chip">−54 dBm</span></div>`;case"graph":return q`<div class="tp-row"><svg viewBox="0 0 200 28" preserveAspectRatio="none" style="width:100%;height:28px;display:block"><polygon points="0,24 25,20 50,22 75,15 100,17 125,11 150,13 175,7 200,5 200,28 0,28" fill="${t}" fill-opacity="0.15"/><polyline points="0,24 25,20 50,22 75,15 100,17 125,11 150,13 175,7 200,5" fill="none" stroke="${t}" stroke-width="1.5" stroke-linecap="round"/></svg></div>`;case"dimmer":return q`<div class="tp-row" style="gap:8px"><span class="tp-lbl">Brightness</span><div class="tp-strack"><div class="tp-sfill" style="width:68%;background:${t}"></div></div><span class="tp-val">68%</span></div>`;case"cover_controls":return q`<div class="tp-row" style="gap:4px"><button class="tp-btn">▲</button><button class="tp-btn">■</button><button class="tp-btn">▼</button></div>`;case"trv_control":return q`<div class="tp-row" style="gap:8px"><svg viewBox="0 0 80 44" style="width:60px;height:34px;flex-shrink:0"><path d="M 8 40 A 32 32 0 1 1 72 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6" stroke-linecap="round"/><path d="M 8 40 A 32 32 0 0 1 52 10" fill="none" stroke="${t}" stroke-width="6" stroke-linecap="round"/><text x="40" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="white">21°</text></svg><span class="tp-val">Now 20°</span></div>`;case"valve_controls":return q`<div class="tp-row" style="gap:4px"><button class="tp-btn">Open</button><button class="tp-btn">Close</button></div>`;case"input_channels":return q`<div class="tp-row tp-chips"><span class="tp-chip" style="color:${t}">● CH1</span><span class="tp-chip">○ CH2</span></div>`;case"relay_channels":return q`<div class="tp-row tp-chips"><span class="tp-chip" style="background:${t}20;color:${t}">CH1 ON</span><span class="tp-chip">CH2 OFF</span></div>`;case"power_bar":return q`<div class="tp-row" style="gap:8px"><div class="tp-strack" style="flex:1"><div class="tp-sfill" style="width:22%;background:${t}"></div></div><span class="tp-val">4.1 W</span></div>`;case"virtual_controls":return q`<div class="tp-row tp-chips"><span class="tp-chip">Mode ▾</span><span class="tp-chip" style="background:${t}20;color:${t}">Script</span></div>`;case"media_controls":return q`<div class="tp-row" style="gap:6px"><span class="tp-lbl">▶ FM957</span><div class="tp-strack" style="flex:1"><div class="tp-sfill" style="width:50%;background:${t}"></div></div><span class="tp-val">50%</span></div>`;case"delegated_controls":return q`<div class="tp-row" style="gap:6px"><span class="tp-lbl">🔒 Front door</span><div class="tp-strack" style="flex:1"><div class="tp-sfill" style="width:100%;background:${t}20"></div></div><span class="tp-val">Locked</span></div>`;case"badges":return q`<div class="tp-row tp-chips"><span class="tp-chip" style="background:rgba(234,179,8,.18);color:#fde047">Dimmer</span><span class="tp-chip" style="background:rgba(34,197,94,.18);color:#86efac">G3</span></div>`;default:return Y}}_layPointerDown(e,t,i){if("mouse"===e.pointerType&&0!==e.button)return;const s=e.currentTarget;try{s.setPointerCapture(e.pointerId)}catch{}this._layDrag={from:{r:t,i:i},chip:s,x:e.clientX,y:e.clientY,pointerId:e.pointerId,active:!1,over:null}}_layTargetAt(e,t){const i=this.shadowRoot?.elementFromPoint(e,t);return i?.closest(".lay-row, .lay-palette")??null}_layPointerMove(e){const t=this._layDrag;if(!t||e.pointerId!==t.pointerId)return;if(!t.active){if(Math.hypot(e.clientX-t.x,e.clientY-t.y)<wo.DRAG_SLOP)return;t.active=!0,t.chip.classList.add("lay-dragging"),t.chip.style.pointerEvents="none"}e.preventDefault();const i=this._layTargetAt(e.clientX,e.clientY);i!==t.over&&(t.over?.classList.remove("lay-over"),i?.classList.add("lay-over"),t.over=i)}_layPointerUp(e){const t=this._layDrag;if(!t||e.pointerId!==t.pointerId)return;const i=t.active?this._layTargetAt(e.clientX,e.clientY):null,s=t.from;if(this._layDragEnd(),i&&this._layMove)if(i.classList.contains("lay-palette"))this._layMove(s,"hide");else if(i.classList.contains("lay-new"))this._layMove(s,"new");else{const e=[...this.shadowRoot?.querySelectorAll(".lay-canvas .lay-row:not(.lay-new)")??[]].indexOf(i);e>=0&&this._layMove(s,{r:e})}}_layDragEnd(){const e=this._layDrag;if(e){e.chip.classList.remove("lay-dragging"),e.chip.style.removeProperty("pointer-events"),e.over?.classList.remove("lay-over");try{e.chip.releasePointerCapture(e.pointerId)}catch{}this._layDrag=null}}_baseStyleOf(e){return"string"==typeof e&&e.startsWith("custom:")?this._config.custom_styles?.[e.slice(7)]?.base??"default":e}_renderLayoutCanvas(e,t,i,s){const o=Rt(e??t),a=new Set(o.flat()),n=Co.map(e=>e.id).filter(e=>!a.has(e)&&(!s||s.has(e)));this._layMove=(e,t)=>{const s=o.map(e=>[...e]);let a;if(e.r<0?a=n[e.i]:(a=s[e.r][e.i],s[e.r].splice(e.i,1)),"new"===t)s.push([a]);else if("hide"!==t){const e=s[t.r];e?e.length<wo.ROW_MAX?e.push(a):s.splice(t.r+1,0,[a]):s.push([a])}const r=s.filter(e=>e.length>0);i(r.length?r:void 0)};const r=(e,t,i)=>q`
      <span class="lay-chip ${t<0?"off":""}"
        @pointerdown=${e=>this._layPointerDown(e,t,i)}
        @pointermove=${e=>this._layPointerMove(e)}
        @pointerup=${e=>this._layPointerUp(e)}
        @pointercancel=${()=>this._layDragEnd()}>${(e=>Co.find(t=>t.id===e)?.label??e)(e)}</span>`,l=this._config.style?.accent_color??"#f4601e";return q`
      <div class="field" style="margin-top:10px">
        <div class="field-lbl" style="display:flex;align-items:center;gap:6px">
          Tile layout
          ${e?this._resetBtn(!0,()=>i(void 0)):Y}
        </div>
        <div class="tile-preview-live" style="--accent:${l}">
          ${o.length?o.map(e=>q`<div class="tp-prow">${e.map(e=>this._blockPreview(e,l))}</div>`):q`<div style="color:var(--t3);font-size:11px;padding:8px;text-align:center">All blocks hidden</div>`}
        </div>
        <div class="lay-canvas">
          ${o.map((e,t)=>q`
            <div class="lay-row">
              ${e.map((e,i)=>r(e,t,i))}
              ${e.length<wo.ROW_MAX?q`<span class="lay-slot">drop here</span>`:Y}
            </div>`)}
          <div class="lay-row lay-new">＋ new row</div>
        </div>
        <div class="field-lbl" style="margin-top:6px">Hidden blocks</div>
        <div class="lay-palette">
          ${n.length?n.map((e,t)=>r(e,-1,t)):q`<span class="dev-style-hint">drag a block here to hide it</span>`}
        </div>
        <div class="hint" style="margin-top:6px">
          Blocks on the same row sit side by side. A block that doesn't apply to the
          device renders nothing, and a row of only those collapses. The graph block
          also needs Show graphs on.
        </div>
      </div>`}_renderStyleElementToggles(e,t,i){const s=Pt[e];if(!s)return q``;const o=t=>this._inheritedElementValue(e,t.id,t.def??!0);return q`
      <div class="field" style="margin-top:10px">
        <div class="field-lbl" style="display:flex;align-items:center;gap:6px">
          Show elements <span class="dev-style-hint">${e}</span>
        </div>
        ${s.map(e=>q`
          <div class="tog-row" style="border:none;padding:3px 0">
            <div class="tog-lbl">${e.label}</div>
            <label class="sw"><input type="checkbox" .checked=${t[e.id]??o(e)}
              @change=${s=>((e,s)=>{const a={...t};s===o(e)?delete a[e.id]:a[e.id]=s,i(Object.keys(a).length?a:void 0)})(e,s.target.checked)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`)}
      </div>`}_renderRoomHeaderChips(e,t){const i=this._allDevices().filter(t=>(t.area??"")===e),s=new Set;for(const e of i)for(const t of e.entities){if("sensor"!==t.domain)continue;const e=t.attributes?.device_class??"",i=Ei.find(i=>i.dc===e||"rssi"===i.key&&("signal_strength"===e||t.entity_id.includes("_rssi")));i&&s.add(i.key)}const o=Ei.filter(e=>s.has(e.key));if(!o.length)return q`<div class="hint" style="margin:2px 2px 6px">No summary sensors in this room.</div>`;const a=this._config.area_header_chips??Ti,n=t.header_chips??a;return q`
      <div class="field" style="margin-bottom:4px">
        ${void 0!==t.header_chips?q`<button class="color-reset" style="margin-bottom:4px" @click=${()=>this._setAreaStyle(e,"header_chips",void 0)}>↺ Default</button>`:Y}
        <div class="pill-grp">
          ${o.map(t=>{const i=n.includes(t.key);return q`<span class="pill ${i?"on":""}" @click=${()=>{const s=i?n.filter(e=>e!==t.key):[...n,t.key];var o;this._setAreaStyle(e,"header_chips",(o=s).length===a.length&&a.every(e=>o.includes(e))?void 0:s)}}>${t.label}</span>`})}
        </div>
        <div class="hint" style="margin-top:4px">Which summary chips this room's header shows. Power is on by default — toggle it off if you don't want it.</div>
      </div>`}_renderGlobalRoomHeaderChips(){const e=new Set;for(const t of this._allDevices())for(const i of t.entities){if("sensor"!==i.domain)continue;const t=i.attributes?.device_class??"",s=Ei.find(e=>e.dc===t||"rssi"===e.key&&("signal_strength"===t||i.entity_id.includes("_rssi")));s&&e.add(s.key)}const t=Ei.filter(t=>e.has(t.key));if(!t.length)return q`<div class="hint" style="margin:2px 2px 6px">No summary sensors discovered yet.</div>`;const i=this._config.area_header_chips??Ti;return q`
      <div class="field" style="margin-bottom:4px">
        ${void 0!==this._config.area_header_chips?q`<button class="color-reset" style="margin-bottom:4px" @click=${()=>this._set("area_header_chips",void 0)}>↺ Default</button>`:Y}
        <div class="pill-grp">
          ${t.map(e=>{const t=i.includes(e.key);return q`<span class="pill ${t?"on":""}" @click=${()=>{const s=t?i.filter(t=>t!==e.key):[...i,e.key];var o;this._set("area_header_chips",(o=s).length===Ti.length&&Ti.every(e=>o.includes(e))?void 0:s)}}>${e.label}</span>`})}
        </div>
        <div class="hint" style="margin-top:4px">Default summary chips for every room header. Power is on by default — toggle it off to drop it. A room can override this in Per-room styling below.</div>
      </div>`}_designKnown(){const e=this._allDevices();return{views:(this._config.views??[]).map(e=>e.id),rooms:[...new Set(e.map(e=>e.area??""))],types:[...new Set(e.map(e=>this._deviceProfile(e)))],devices:e.map(e=>e.device_id)}}_designScopeStorageKey(){return`hdd:designScope:${this._config?.title??"default"}`}_hydrateDesignScope(){if(!this._designScopeLoaded&&this.hass&&this._config){this._designScopeLoaded=!0;try{this._designScope=function(e,t){if(!e||"global"===e)return Zs;const i=e.indexOf(":");if(i<0)return Zs;const s=e.slice(0,i),o=e.slice(i+1);return"view"===s&&t.views.includes(o)?{kind:"view",id:o}:"room"===s&&t.rooms.includes(o)?{kind:"room",name:o}:"type"===s&&t.types.includes(o)?{kind:"type",profile:o}:"device"===s&&t.devices.includes(o)?{kind:"device",id:o}:Zs}(localStorage.getItem(this._designScopeStorageKey()),this._designKnown())}catch{}}}_setDesignScope(e){this._designScope=e,this._iaAllEntities=null;try{localStorage.setItem(this._designScopeStorageKey(),eo(e))}catch{}}_deviceProfile(e){return this._config.device_styles?.[e.device_id]?.profile??ei(e).type}_designOverrides(){return this._config?function(e,t){const i=[],s=(e,t,s)=>{if(t)for(const o of s)void 0!==t[o]&&i.push({scope:e,key:o,value:t[o]})};s(Zs,e,oo.filter(e=>"style"!==e&&"theme"!==e&&"tileGap"!==e));const o=e.style??{};for(const[e,s]of Object.entries(o)){if(void 0===s)continue;const o=t?.[e];void 0!==o&&o===s||i.push({scope:Zs,key:e,value:s,palette:void 0!==o})}for(const t of e.views??[])s({kind:"view",id:t.id},t,oo);for(const[t,i]of Object.entries(e.area_styles??{}))s({kind:"room",name:t},i,oo);for(const[t,i]of Object.entries(e.profile_styles??{}))s({kind:"type",profile:t},i,oo);for(const[t,i]of Object.entries(e.device_styles??{}))s({kind:"device",id:t},i,[...oo,...so]);return i}(this._config,qe(this._config.theme)):[]}_clearOverride(e){const t=this._config;switch(e.scope.kind){case"global":if(e.palette||void 0!==t.style?.[e.key]){const i={...t.style??{}};delete i[e.key],this._set("style",Object.keys(i).length?i:void 0)}else this._set(e.key,void 0);return;case"view":return void this._updateView(e.scope.id,{[e.key]:void 0});case"room":return void this._setAreaStyle(e.scope.name,e.key,void 0);case"type":return void this._setProfileStyle(e.scope.profile,{[e.key]:void 0});case"device":return void this._setDeviceStyle(e.scope.id,{[e.key]:void 0})}}_renderChangesPanel(){const e=this._designOverrides(),t=this._allDevices(),i=e=>to(e.scope,{viewName:e=>(this._config.views??[]).find(t=>t.id===e)?.name||e,deviceName:e=>t.find(t=>t.device_id===e)?.name??e}),s=new Map;for(const t of e){const e=i(t);s.has(e)||s.set(e,[]),s.get(e).push(t)}return q`
      <div class="changes-panel">
        ${0===e.length?q`<div class="hint">Nothing is customised. Every tile, room and view is
                 rendering the theme exactly as it ships.</div>`:q`
            <div class="changes-hdr">
              <span>${e.length} setting${e.length>1?"s":""} differ from the default look</span>
              <span class="sec-toolbar-spacer"></span>
              <button class="sec-toolbar-btn"
                style=${this._changesResetArmed?"color:#f4601e;border-color:#f4601e":""}
                title="Drop every one of these and return to the theme"
                @click=${()=>{if(this._changesResetArmed){this._changesResetArmed=!1;for(const t of e)this._clearOverride(t)}else this._changesResetArmed=!0}}>${this._changesResetArmed?`Click again to reset all ${e.length}`:"↺ Reset all"}</button>
            </div>
            ${[...s.entries()].map(([e,t])=>q`
              <div class="changes-group">
                <div class="changes-scope">${e}<span class="dsn-count">${t.length}</span></div>
                ${t.map(e=>q`
                  <div class="changes-row">
                    <span class="changes-key">${e.key}${e.palette?q`<span class="changes-pal">palette</span>`:Y}</span>
                    <span class="changes-val">${(e=>{const t="object"==typeof e?JSON.stringify(e):String(e);return t.length>42?`${t.slice(0,42)}…`:t})(e.value)}</span>
                    <button class="dsn-reset" title="Drop this one"
                      @click=${()=>this._clearOverride(e)}>↺</button>
                  </div>`)}
              </div>`)}`}
      </div>`}_globalEffectiveStyle(){return Vi(this._baseStyleOf(this._config.tile_style)).style}_effectiveScopeStyle(){const e=this._designScope;let t=this._scopeValues().tile_style??this._inheritedFrom("tile_style")?.value;if(!t&&this._config.smart_tile_styles)if("device"===e.kind){const i=this._allDevices().find(t=>t.device_id===e.id);i&&(t=zt(this._deviceProfile(i),i))}else"type"===e.kind&&(t=Ot[e.profile]);return Vi(this._baseStyleOf(t)).style}_setGlobalElements(e){const t=this._globalEffectiveStyle(),i={...this._config.style_presets??{}},s={...i[t]??{}};e&&Object.keys(e).length?s.elements=e:delete s.elements,Object.keys(s).length?i[t]=s:delete i[t],this._set("style_presets",Object.keys(i).length?i:void 0)}_inheritedElementValue(e,t,i){const s=this._config,o=this._designScope,a=[];if("device"===o.kind){const e=this._allDevices().find(e=>e.device_id===o.id);e&&(a.push(s.profile_styles?.[this._deviceProfile(e)]?.elements),e.area&&a.push(s.area_styles?.[e.area]?.elements))}"global"!==o.kind&&a.push(s.style_presets?.[e]?.elements);for(const e of a){const i=e?.[t];if(void 0!==i)return i}return i}_patchScope(e){const t=this._designScope;switch(t.kind){case"global":for(const[t,i]of Object.entries(e))"elements"!==t?this._set(t,i):this._setGlobalElements(i);return;case"view":return void this._updateView(t.id,e);case"room":for(const[i,s]of Object.entries(e))this._setAreaStyle(t.name,i,s);return;case"type":return void this._setProfileStyle(t.profile,e);case"device":return void this._setDeviceStyle(t.id,e)}}_scopeValues(){const e=this._designScope,t=this._config;switch(e.kind){case"global":{const e=t.style_presets?.[this._globalEffectiveStyle()]?.elements;return void 0!==e?{...t,elements:e}:t}case"view":return(t.views??[]).find(t=>t.id===e.id)??{};case"room":return t.area_styles?.[e.name]??{};case"type":return t.profile_styles?.[e.profile]??{};case"device":return t.device_styles?.[e.id]??{}}}_inheritedFrom(e){const t=this._config,i=this._designScope,s=[],o="device"===i.kind?this._allDevices().find(e=>e.device_id===i.id):void 0;if("device"===i.kind&&o){const e=this._deviceProfile(o);s.push({label:`Type · ${e}`,block:t.profile_styles?.[e]}),s.push({label:`Room · ${o.area||"No room"}`,block:t.area_styles?.[o.area??""]})}if("global"!==i.kind&&"view"!==i.kind){const e=(t.views??[]).find(e=>e.id===(t.default_view??t.views?.[0]?.id));e&&s.push({label:`View · ${e.name||e.id}`,block:e})}"global"!==i.kind&&s.push({label:"Card",block:t});for(const t of s){const i=t.block?.[e];if(void 0!==i)return{label:t.label,value:i}}}_designRow(e,t,i,s){const o=void 0!==this._scopeValues()[t],a=o?void 0:this._inheritedFrom(t);return q`
      <div class="dsn-row ${o?"set":""}">
        <div class="dsn-row-hdr">
          <span class="dsn-row-lbl">${e}</span>
          ${o?q`<span class="dsn-badge on">set here</span>
                   <button class="dsn-reset" title="Drop this override and inherit again"
                     @click=${()=>this._patchScope({[t]:void 0})}>↺</button>`:q`<span class="dsn-badge">${a?`from ${a.label}`:"default"}</span>`}
        </div>
        ${i}
        ${s?q`<div class="hint" style="margin-top:2px">${s}</div>`:Y}
      </div>`}_designFamily(e,t,i){return Js(this._designScope,e)?q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">${t}</div>
        ${i()}
      </div>`:q`
        <div class="dsn-family off">
          <div class="dsn-family-hdr">${t}</div>
          <div class="hint">${function(e,t){if(!Js(e,t))return"container"===t?"device"===e.kind?"Columns, tile size and gap belong to the grid a tile sits in, not to one device. Set them on the room, the view, or the card.":"A device type is a set of tiles scattered across rooms, so it has no grid of its own. Set these on the room, the view, or the card.":"The header and the card surface belong to the card. Only a view can restyle them, because a view replaces what the whole card shows."}(this._designScope,e)}</div>
        </div>`}_renderDesignScopePicker(){const e=this._config,t=eo(this._designScope),i=function(e,t,i){const s=new Map;for(const o of e){let e,a;if("room"===t)e=o.area||"No room",a={kind:"room",name:o.area??""};else if("type"===t){const t=i(o);e=t,a={kind:"type",profile:t}}else e=o.integration||"unknown",a=void 0;let n=s.get(e);n||(n={label:e,scope:a,devices:[]},s.set(e,n)),n.devices.push({id:o.device_id,name:o.name})}for(const e of s.values())e.devices.sort((e,t)=>e.name.localeCompare(t.name));return[...s.values()].sort((e,t)=>e.label.localeCompare(t.label))}(this._allDevices(),this._designGroupBy,e=>this._deviceProfile(e)),s=(i,s,o="")=>q`
      <button class="dsn-chip ${t===eo(i)?"on":""} ${o}"
        @click=${()=>this._setDesignScope(i)}>${s}${(t=>{const i=function(e,t,i){const s=function(e,t){switch(t.kind){case"global":return e;case"view":return(e.views??[]).find(e=>e.id===t.id);case"room":return e.area_styles?.[t.name];case"type":return e.profile_styles?.[t.profile];case"device":return e.device_styles?.[t.id]}}(e,t);return s?i.filter(e=>void 0!==s[e]).length:0}(e,t,ao(t));return i?q`<span class="dsn-count">${i}</span>`:Y})(i)}</button>`;return q`
      <div class="dsn-picker">
        <div class="dsn-pick-row">${s(Zs,"Global")}</div>

        ${(e.views??[]).length?q`
          <div class="dsn-pick-lbl">Views</div>
          <div class="dsn-pick-row">
            ${(e.views??[]).map(e=>s({kind:"view",id:e.id},e.name||e.id))}
          </div>`:Y}

        <div class="dsn-pick-lbl">
          Devices, grouped by
          ${["room","type","integration"].map(e=>q`
            <button class="dsn-groupby ${this._designGroupBy===e?"on":""}"
              @click=${()=>{this._designGroupBy=e}}>${e}</button>`)}
        </div>
        <div class="dsn-tree">
          ${i.map(e=>{const t=this._designOpenGroups.has(e.label);return q`
              <div class="dsn-group">
                <div class="dsn-group-hdr">
                  <button class="dsn-twisty" @click=${()=>{const i=new Set(this._designOpenGroups);t?i.delete(e.label):i.add(e.label),this._designOpenGroups=i}}>${t?"▾":"▸"}</button>
                  ${e.scope?s(e.scope,e.label,"grp"):q`<span class="dsn-chip grp browse"
                        title="An integration is not a styling layer — expand it to reach its devices">${e.label}</span>`}
                  <span class="dsn-group-n">${e.devices.length}</span>
                </div>
                ${t?q`
                  <div class="dsn-group-body">
                    ${e.devices.map(e=>s({kind:"device",id:e.id},e.name,"dev"))}
                  </div>`:Y}
              </div>`})}
        </div>
      </div>`}_designGlobalSections(e){const t=this._globalSectionDescriptors(),i=new Set(uo.flatMap(e=>e.sections.filter(e=>e.advanced).map(e=>e.id)));return q`${e.map(e=>{const s=t[e];if(!s)return Y;const o=this._sec(`design-${e}`,s.icon,s.bg,s.fg,s.label,s.badge,s.body);return i.has(e)?this._adv(o):o})}`}_renderDesignPanel(){const e=this._designScope,t=this._scopeValues(),i=this._allDevices(),s=to(e,{viewName:e=>(this._config.views??[]).find(t=>t.id===e)?.name||e,deviceName:e=>i.find(t=>t.device_id===e)?.name??e}),o=ao(e).filter(e=>void 0!==t[e]).length,a=()=>{"device"===e.kind?this._saveDeviceAsStyle(e.id):"type"===e.kind&&this._saveProfileAsStyle(e.profile)},n=("device"===e.kind||"type"===e.kind)&&o>0;return q`
      <div class="dsn-panel">
        <div class="dsn-scope-hdr ${"design-scope"===this._flashControl?"ctl-flash":""}" data-ctl="design-scope">
          <span class="dsn-scope-name">${s}</span>
          ${o?q`<span class="dsn-badge on">${o} set here</span>`:q`<span class="dsn-badge">nothing set — all inherited</span>`}
        </div>
        ${n?q`
          <div class="dsn-save-row">
            <input type="text" class="inline-text" style="flex:1" placeholder="Save this look as a style — name it…"
              .value=${this._newStyleName}
              @input=${e=>{this._newStyleName=e.target.value}}
              @keydown=${e=>{"Enter"===e.key&&a()}}/>
            <button class="dsn-reset" style="padding:4px 10px" ?disabled=${!this._newStyleName.trim()}
              title="Keep these settings as a reusable style in Saved looks"
              @click=${a}>Save</button>
          </div>`:Y}
        ${this._designFamily("tile","Tile — device → type → room → view → card",()=>{const i=this._effectiveScopeStyle(),s=$o.find(e=>e.v===i)?.label??i,o="global"===e.kind&&"default"!==i&&(()=>{const e=e=>void 0!==e&&"default"===Vi(this._baseStyleOf(e)).style;return Object.values(this._config.device_styles??{}).some(t=>e(t.tile_style))||Object.values(this._config.profile_styles??{}).some(t=>e(t.tile_style))||Object.values(this._config.area_styles??{}).some(t=>e(t.tile_style))||(this._config.views??[]).some(t=>e(t.tile_style))})(),a="default"===i||o;return q`
      ${this._designRow("Colour theme","theme","global"===e.kind?this._designGlobalSections(["theme"]):this._themeOverrideSelect(t.theme,e=>this._patchScope({theme:e}),"device"===e.kind||"type"===e.kind?"Repaints this tile only — 13 of the 19 palette keys. The card surface and header are not inside a tile.":"Repaints everything this layer contains."))}

      ${this._designRow("Tile style","tile_style",this._renderTileStylePicker(t.tile_style,t.power_monitor_variant??"big-number",void 0,e=>this._patchScope({tile_style:e}),e=>this._patchScope({power_monitor_variant:e}),t.show_graphs,e=>this._patchScope({show_graphs:e})))}

      ${this._designRow("Blocks","tile_layout",a?q`
            ${o?q`<div class="hint" style="margin-bottom:4px">
                These tiles render as <b>${s}</b>, but some rooms, types or
                devices switch back to the adaptive style — this layout is what
                those tiles use.
              </div>`:Y}
            ${this._renderLayoutCanvas(t.tile_layout,Rt(this._inheritedFrom("tile_layout")?.value??Bt.generic),e=>this._patchScope({tile_layout:e}))}`:q`<div class="hint">
              These tiles render as <b>${s}</b>, which draws its own fixed
              layout — blocks only shape the <b>Default</b> (adaptive) tile style.
              Use Elements below to show or hide this style's parts, or switch
              Tile style to Default to arrange blocks.
            </div>`,a?"Drag to reorder or drop into a row. Blocks only apply to the adaptive tile style.":void 0)}

      ${(()=>Pt[i]?this._designRow("Elements","elements",this._renderStyleElementToggles(i,t.elements??{},e=>this._patchScope({elements:e}))):Y)()}

      ${this._designRow("Sensor chips","sensors",this._chipPicker(t.sensors,this._inheritedFrom("sensors")?.value,this._inheritedFrom("sensors")?.label??"the default (all shown)",e=>this._patchScope({sensors:e}),void 0,this._scopeSensorEntities()))}

      ${this._designRow("Energy window","energy_period",this._renderEnergyPeriodPicker(t.energy_period,e=>this._patchScope({energy_period:e})))}`})}
        ${this._designFamily("container","Container — room → view → card",()=>q`
      ${this._designRow("Columns","columns",q`
        <div class="sl-row">
          <input type="range" min="1" max="6" step="1" style="flex:1;accent-color:#f4601e"
            .value=${String(t.columns??this._inheritedFrom("columns")?.value??3)}
            @input=${e=>this._patchScope({columns:parseInt(e.target.value,10)})}/>
          <span class="sl-val">${t.columns??this._inheritedFrom("columns")?.value??3}</span>
        </div>`)}

      ${this._designRow("Tile size","tile_size",q`
        <div class="pill-grp">
          ${["sm","md","lg"].map((e,i)=>q`
            <span class="pill ${t.tile_size===e?"on":""}"
              @click=${()=>this._patchScope({tile_size:e})}>${["Small","Medium","Large"][i]}</span>`)}
        </div>`)}`)}
        ${this._designFamily("chrome","Card chrome — view → card",()=>{if("global"===e.kind)return q`
          <div class="hint" style="margin-bottom:6px">
            The card's own header, surface and type. Every layer below inherits these.
          </div>
          ${this._designGlobalSections(["header","card","colors","typography"])}`;const i=t.style??{},o=(e,t)=>{const s={...i};void 0===t?delete s[e]:s[e]=t,this._patchScope({style:Object.keys(s).length?s:void 0})},a=(e,t,a)=>q`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${i[t]??a}"></div>
          <span class="color-key">${e}</span>
          ${this._wheelButton(i[t]??a,e=>o(t,e),s)}
          ${void 0!==i[t]?q`<button class="color-reset" @click=${()=>o(t,void 0)}>↺</button>`:Y}
        </div>`,n=Object.keys(i).length;return q`
        <div class="dsn-row ${n?"set":""}">
          <div class="dsn-row-hdr">
            <span class="dsn-row-lbl">Header &amp; card surface</span>
            ${n?q`<span class="dsn-badge on">${n} set here</span>
                     <button class="dsn-reset" title="Drop this view's chrome overrides"
                       @click=${()=>this._patchScope({style:void 0})}>↺</button>`:q`<span class="dsn-badge">from Card</span>`}
          </div>
          ${a("Header gradient start","header_bg","#1a1a2e")}
          ${a("Header gradient end","header_bg2","#0f3460")}
          ${a("Header text","header_text_color","#ffffff")}
          ${a("Card background","card_bg","#1c1c1e")}
          <div class="field" style="margin-top:6px">
            <div class="field-lbl">Header icon</div>
            <input type="text" class="inline-text" maxlength="4" style="width:60px;text-align:center"
              .value=${i.header_icon??""}
              @change=${e=>o("header_icon",e.target.value.trim()||void 0)}/>
          </div>
          <div class="hint" style="margin-top:4px">
            A view's theme already re-bases these; set one here only to bend a single
            colour out of that theme.
          </div>
        </div>`})}
        ${"device"===e.kind?this._renderSafetyBlock(e.id):Y}
        ${"device"===e.kind?this._renderTilePhotoBlock(e.id):Y}
        ${"device"===e.kind?this._renderAnimIconsBlock(e.id):Y}
        ${"device"===e.kind?this._renderExtraSensorsBlock(e.id):Y}
        ${"device"===e.kind?this._renderInputActionsBlock(e.id):Y}
        ${"room"===e.kind?q`
          <div class="dsn-family">
            <div class="dsn-family-hdr">Room chrome — this room only</div>
            <div class="hint" style="margin-bottom:6px">
              The room block's own dressing — backdrop photo, header colours,
              borders, header chips, button shapes. These exist once per room,
              so there is no ladder under them.
            </div>
            ${this._renderRoomChromeBody(e.name)}
          </div>`:Y}
        ${"global"===e.kind?this._renderSavedLooks():Y}
        ${"global"===e.kind?q`
          <div class="dsn-family">
            <div class="dsn-family-hdr">Card-wide — no layers under these</div>
            <div class="hint" style="margin-bottom:6px">
              Settings that exist once for the whole card. There is nothing to
              override them with, which is why they only appear at Global.
            </div>
            ${this._designGlobalSections(["content","tiles","electrical","environmental","deviceinfo","alerts"])}
          </div>`:Y}
      </div>`}_renderSavedLooks(){const e=this._config,t=Object.entries(e.custom_styles??{}),i=Object.entries(e.style_presets??{}),s=Object.entries(this._palettes);return t.length||i.length||s.length?q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Saved looks — point any layer at one</div>
        ${t.length?q`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">Tile styles</span>
              <span class="dsn-badge">in the config</span></div>
            <div class="dsn-pick-row">
              ${t.map(([e,t])=>q`
                <span class="dsn-chip">${t.label??e}
                  <button class="saved-x" title="Forget this style and clear every tile using it"
                    @click=${()=>this._deleteCustomStyle(e)}>✕</button>
                </span>`)}
            </div>
            <div class="hint" style="margin-top:4px">Assigned as the Tile style of any scope.</div>
          </div>`:Y}
        ${i.length?q`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">Style presets</span>
              <span class="dsn-badge">in the config</span></div>
            <div class="dsn-pick-row">
              ${i.map(([e])=>q`<span class="dsn-chip">${e}</span>`)}
            </div>
            <div class="hint" style="margin-top:4px">
              Defaults for one built-in tile style, applied wherever that style resolves —
              between the view and the card.
            </div>
          </div>`:Y}
        ${s.length?q`
          <div class="dsn-row">
            <div class="dsn-row-hdr"><span class="dsn-row-lbl">★ Palettes</span>
              <span class="dsn-badge">this browser only</span></div>
            <div class="dsn-pick-row">
              ${s.map(([e])=>q`
                <span class="dsn-chip">
                  <button class="dsn-chip-apply" title="Apply these colours to the card"
                    @click=${()=>this._applyPalette(e)}>★ ${e}</button>
                  <button class="saved-x" title="Forget this palette"
                    @click=${()=>this._deletePalette(e)}>✕</button>
                </span>`)}
            </div>
            <div class="hint" style="margin-top:4px">
              Kept in this browser, not in the config — they do not follow the dashboard
              to another device, and are keyed to the card's title.
            </div>
          </div>`:Y}
      </div>`:q`
        <div class="dsn-family off">
          <div class="dsn-family-hdr">Saved looks</div>
          <div class="hint">
            Nothing saved yet. 💾 in the theme picker keeps the colours you are looking
            at; "Save as style" on a device keeps its whole tile setup for reuse.
          </div>
        </div>`}_renderDesignTab(){return this._hydrateDesignScope(),q`
      ${this._sec("design-scope","◈","rgba(129,140,248,0.1)","#818cf8","Scope — what am I editing?",Y,this._renderDesignScopePicker())}
      ${this._sec("design-panel","◉","rgba(244,96,30,0.1)","#f4601e","Controls",Y,this._renderDesignPanel())}`}_themeOverrideSelect(e,t,i){return q`
      <div class="field">
        <div class="field-lbl">Colour theme</div>
        <select class="inline-text" style="width:100%"
          @change=${e=>{const i=e.target.value;t(i||void 0)}}>
          <option value="" ?selected=${!e||"custom"===e}>Inherit</option>
          <option value="ha" ?selected=${"ha"===e}>${Ue.ha}</option>
          ${He.map(t=>q`
            <option value=${t} ?selected=${e===t}>${Ue[t]}</option>`)}
        </select>
        <div class="hint" style="margin-top:4px">${i}</div>
      </div>`}async _ensureHaPickers(){if(customElements.get("ha-entity-picker"))this._haPickersReady=!0;else{try{const e=window.loadCardHelpers,t=e?await e():void 0,i=t?.createCardElement({type:"entities",entities:[]});await(i?.constructor?.getConfigElement?.())}catch{}this._haPickersReady=!!customElements.get("ha-entity-picker")}}_scopeSensorEntities(){const e=this._designScope;if("device"!==e.kind)return[];const t=this._allDevices().find(t=>t.device_id===e.id);return(t?.entities??[]).filter(e=>"sensor"===e.domain||"binary_sensor"===e.domain).map(e=>e.entity_id)}_entityName(e){return this.hass?.states[e]?.attributes?.friendly_name??e}_entityField(e,t,i){const s=Array.isArray(e)?e:e?[e]:[],o=e=>{const i=[...new Set(e.map(e=>e.trim()).filter(Boolean))];t(i.length>1?i:i[0]||void 0)};if(!this._haPickersReady){const e=`hdd-ents-${(i.deviceEntities[0]??"x").replace(/\W/g,"")}`;return q`
        <input type="text" class="inline-text" style="width:100%" list=${e}
          placeholder=${i.placeholder} .value=${s.join(", ")}
          @change=${e=>o(e.target.value.split(","))}/>
        <datalist id=${e}>${i.deviceEntities.map(e=>q`<option value=${e}></option>`)}</datalist>`}const a=i.scopeAll?void 0:i.deviceEntities,n=(e,t)=>q`
      <ha-entity-picker class="ia-picker" .hass=${this.hass} .value=${e}
        .includeEntities=${a} allow-custom-entity
        @value-changed=${e=>{e.stopPropagation(),t(String(e.detail?.value??"").trim())}}
      ></ha-entity-picker>`,r=i.note?q`<div class="ia-note">${i.note}</div>`:Y;return i.multi?q`
      ${s.length?q`
        <div class="ia-chips">
          ${s.map(e=>q`
            <span class="ia-chip" title=${e}>${this._entityName(e)}
              <button class="ia-chip-x" title="Remove" @click=${()=>o(s.filter(t=>t!==e))}>×</button>
            </span>`)}
        </div>`:Y}
      ${Xs(s.join("|"),n("",e=>{e&&o([...s,e])}))}
      ${r}`:q`${n(s[0]??"",e=>o(e?[e]:[]))}${r}`}_renderSafetyBlock(e){const t=this._config.device_styles?.[e]??{},i=this._allDevices().find(t=>t.device_id===e),s=this._config.delegate_controls&&i&&!["relay","plug","dimmer","rgb"].includes(this._deviceProfile(i));return q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Safety — this device only</div>
        <div class="tog-row" style="border:none;padding:0 0 6px">
          <div class="tog-lbl">Ask before turning off
            <span class="field-note">a mis-tap on a freezer, a server or the router is expensive; turning on is never confirmed</span></div>
          <label class="sw"><input type="checkbox" .checked=${!0===t.confirm_off}
            @change=${t=>this._setDeviceStyle(e,{confirm_off:!!t.target.checked||void 0})}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
        ${t.confirm_off&&s?q`
          <div class="dp-hint-inline">
            Native controls are on for this device, and a control drawn by Home Assistant
            switches it directly — the prompt only covers the card's own on/off buttons.
          </div>`:Y}
      </div>`}_renderTilePhotoBlock(e){const t=this._config.device_styles?.[e]??{};return q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Tile photo — this device only</div>
        <div class="hint" style="margin-bottom:6px">
          A backdrop behind this one tile — the device itself, or where it lives. A room's
          backdrop is under room scope; the card-wide tile photo is under Global.
        </div>
        ${this._renderBgImagePicker("Tile background photo",`dev-bg-${e}`,t.bg_image,t.bg_image_size,t=>this._setDeviceStyle(e,{bg_image:t}),t=>this._setDeviceStyle(e,{bg_image_size:t}),()=>this._setDeviceStyle(e,{bg_image:void 0,bg_image_size:void 0}))}
      </div>`}_renderAnimIconsBlock(e){const t=this._allDevices().find(t=>t.device_id===e),i=this._config.device_styles?.[e]??{},s=i.entity_animations??{},o=(t,i)=>{const o={...s[t]??{},...i};["on","off","speed","size"].forEach(e=>{void 0===o[e]&&delete o[e]});const a={...s};Object.keys(o).length?a[t]=o:delete a[t],this._setDeviceStyle(e,{entity_animations:Object.keys(a).length?a:void 0})},a=(t?.entities??[]).filter(e=>("switch"===e.domain||"light"===e.domain)&&!e.entity_category),n=e=>{const i=this._entityName(e),s=t?.name?.trim()??"";return s&&i.toLowerCase().startsWith(s.toLowerCase())&&i.slice(s.length).trim()||i},r=(e,t,i,s,o)=>q`
      <span class="anim-state">${e}</span>
      <input type="range" min=${i} max=${s} step="0.25" .value=${String(t??1)}
        style="width:72px;accent-color:#f4601e" title="${e} ×${t??1} — ×1 is the default"
        @input=${e=>{const t=parseFloat(e.target.value);o(1===t?void 0:t)}}/>
      <span class="sl-val">×${t??1}</span>`,l=(e,t)=>q`
      <div class="anim-row">
        <span class="anim-state">ON</span>${this._iconPicker(e.on,!0,t.on)}
        <span class="anim-state">OFF</span>${this._iconPicker(e.off,!1,t.off)}
        ${r("Speed",e.speed,.25,3,t.speed)}
        ${r("Size",e.size,.5,3,t.size)}
      </div>`;return q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Animated icons — this device only</div>
        <div class="hint" style="margin-bottom:6px">
          The tile's header icon — one look while ON and one while OFF (OFF falls back to the ON
          pick) — and, under Advanced, an icon beside each of this device's own switches. The
          adaptive tile and the scene button draw them; the other styles have no header icon.
        </div>
        <div class="ia-grid">
          <span class="ia-lbl">Tile icon</span>
          ${l({on:i.tile_icon,off:i.tile_icon_off,speed:i.tile_icon_speed,size:i.tile_icon_size},{on:t=>this._setDeviceStyle(e,{tile_icon:t}),off:t=>this._setDeviceStyle(e,{tile_icon_off:t}),speed:t=>this._setDeviceStyle(e,{tile_icon_speed:t}),size:t=>this._setDeviceStyle(e,{tile_icon_size:t})})}
          ${this._advanced?a.map(e=>q`
            <span class="ia-lbl" title=${e.entity_id}>${n(e.entity_id)}</span>
            ${l(s[e.entity_id]??{},{on:t=>o(e.entity_id,{on:t}),off:t=>o(e.entity_id,{off:t}),speed:t=>o(e.entity_id,{speed:t}),size:t=>o(e.entity_id,{size:t})})}`):Y}
        </div>
        ${!this._advanced&&a.length?q`
          <div class="dp-hint-inline">Turn on Advanced for per-switch icons (${a.length} on this device).</div>`:Y}
      </div>`}_renderExtraSensorsBlock(e){const t=this._allDevices().find(t=>t.device_id===e),i=this._config.device_styles?.[e]?.extra_sensors??[],s=i.map(e=>this._entityName(e)).filter(Boolean);return q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Extra sensors — this device only</div>
        <div class="hint" style="margin-bottom:6px">
          Readings that live on another device, shown on this tile as if it reported them —
          a BLU H&amp;T's temperature on a Wall Display XL, which has no temperature sensor of
          its own. They join the chips, graphs, gauge rings and the detail sheet like the
          device's own sensors; the other device keeps showing them too.
        </div>
        ${this._entityField(i.length?i:void 0,t=>{const i=Array.isArray(t)?t:t?[t]:[];this._setDeviceStyle(e,{extra_sensors:i.length?i:void 0})},{deviceEntities:t?t.entities.map(e=>e.entity_id):[],scopeAll:!0,multi:!0,placeholder:"Sensor entity on another device",note:s.length?`Borrowing: ${s.join(", ")}`:"Pick sensor.* entities — temperature, humidity, lux, CO₂, battery."})}
      </div>`}_renderInputActionsBlock(e){const t=this._allDevices().find(t=>t.device_id===e),i=t?Ni(t,this.hass.states):[];if(!i.length)return q``;const s=(this._config.device_styles?.[e]??{}).input_actions??{},o=e=>Array.isArray(e)?e.join(", "):e??"",a=e=>void 0!==s[e.entityId]?e.entityId:void 0!==s[String(e.channel)]?String(e.channel):e.entityId,n=(t,i)=>{const o={...s};i?o[t]={...o[t]??{action:"none"},...i}:delete o[t],this._setDeviceStyle(e,{input_actions:Object.keys(o).length?o:void 0})},r=t?t.entities.map(e=>e.entity_id):[],l=!!t&&It(t),c=this._iaAllEntities??!l,d=(e,t,i,s=!0,o)=>this._entityField(e,t,{deviceEntities:r,scopeAll:c,placeholder:i,multi:s,note:o}),p=(e,t)=>(e=>Array.isArray(e)?0===e.length:!e)(e)&&o(t)?`Optional — leave empty to use the tap target (${o(t)})`:void 0;return q`
      <div class="dsn-family">
        <div class="dsn-family-hdr">Input actions — this device only</div>
        <div class="hint" style="margin-bottom:6px">
          What a tap on each input's row or key does. A <b>button</b> input reports
          presses; a <b>switch</b> input reports its position. An input wired to a
          relay on this device toggles that relay by default — input-only hardware
          (i3/i4, UNI) has no output, so give its channels the action the physical
          button is wired to and the rows become keys.
        </div>
        <div class="field" style="margin-bottom:8px">
          <div class="field-lbl">Entity search covers</div>
          <div class="pill-grp">
            <span class="pill ${c?"":"on"}" @click=${()=>{this._iaAllEntities=!1}}>This device's entities</span>
            <span class="pill ${c?"on":""}" @click=${()=>{this._iaAllEntities=!0}}>All entities</span>
          </div>
          <div class="dp-hint-inline">${this._haPickersReady?"Type to search — names, rooms and entity ids all match.":"Home Assistant's picker has not loaded; type entity ids, comma-separated for several."}</div>
        </div>
        ${i.map(e=>{const i=s[e.entityId]??s[String(e.channel)],o=i?.action??"default",r="default"!==o&&"none"!==o,l=i?.double_tap_action,c="button"===e.kind&&!!t?.isShelly,h=(()=>{if(!e.output)return"";const i=this._entityName(e.output),s=t?.name?.trim()??"";return s&&i.toLowerCase().startsWith(s.toLowerCase())&&i.slice(s.length).trim()||i})(),u=e.output?`— default: toggles ${h} —`:"— none: row shows the press history —";return q`
            <div class="ia-ch ${r?"set":""}">
              <div class="ia-ch-hdr">
                <span class="ia-ch-name" title="${e.entityId} · ${e.kind}">${e.label}
                  <span class="dev-style-hint">${e.kind}</span></span>
                <select class="inline-text" style="flex:1"
                  @change=${t=>{const i=t.target.value;n(a(e),"default"===i?null:{action:i})}}>
                  <option value="default" ?selected=${"default"===o}>${u}</option>
                  ${e.output?q`<option value="none" ?selected=${"none"===o}>— status only, no tap action —</option>`:Y}
                  ${c?q`<option value="press" ?selected=${"press"===o}>Replay the press — runs your automations</option>`:Y}
                  <option value="perform-action" ?selected=${"perform-action"===o}>Run script / service</option>
                  <option value="toggle" ?selected=${"toggle"===o}>Toggle entity</option>
                  <option value="more-info" ?selected=${"more-info"===o}>Show more-info</option>
                </select>
              </div>
              ${r?q`
                <div class="ia-grid">
                  ${"perform-action"===o?q`
                    <span class="ia-lbl">Service</span>
                    <input type="text" class="inline-text" placeholder="script.hall_lights — or light.turn_on"
                      .value=${i?.perform_action??""}
                      @change=${t=>n(a(e),{perform_action:t.target.value.trim()||void 0})}/>
                    <span class="ia-lbl">Target</span>
                    <div>${d(i?.entity,t=>n(a(e),{entity:t}),"Target entity — optional")}</div>`:Y}
                  ${"toggle"===o?q`
                    <span class="ia-lbl">Toggles</span>
                    <div>${d(i?.entity,t=>n(a(e),{entity:t}),"Entity to toggle")}</div>`:Y}
                  ${"more-info"===o?q`
                    <span class="ia-lbl">Shows</span>
                    <div>${d(i?.entity,t=>n(a(e),{entity:t}),"Entity to show",!1,`Empty = this channel (${e.entityId})`)}</div>`:Y}
                  ${"press"===o?q`
                    <div class="ia-hint">Fires the same <code>shelly.click</code> event as the wall button — device_id,
                      button number, click type — so every automation with a Shelly device trigger on this button runs
                      as-is, nothing configured twice. Automations that trigger on the event entity itself do not see
                      it, and firing events needs an admin login.</div>
                    ${this._advanced?q`
                      <span class="ia-lbl">Button</span>
                      <input type="number" class="inline-text" min="1" max="8" style="max-width:90px"
                        placeholder="auto" .value=${null!=i?.channel?String(i.channel):""}
                        title="Button number as the automation editor counts it. Empty = read from the entity registry."
                        @change=${t=>{const i=parseInt(t.target.value,10);n(a(e),{channel:Number.isFinite(i)&&i>0?i:void 0})}}/>`:Y}`:Y}

                  <span class="ia-lbl">On hold</span>
                  <select class="inline-text"
                    @change=${t=>{const i=t.target.value;n(a(e),{hold_action:"none"===i?void 0:{action:i}})}}>
                    <option value="none" ?selected=${"none"===(i?.hold_action?.action??"none")}>— nothing —</option>
                    ${c?q`<option value="press" ?selected=${"press"===i?.hold_action?.action}>Replay a long push</option>`:Y}
                    <option value="dim" ?selected=${"dim"===i?.hold_action?.action}>Dim the light while held</option>
                  </select>
                  ${"dim"===i?.hold_action?.action?q`
                    <span class="ia-lbl">Dims</span>
                    <div>${d(i.hold_action.entity,t=>n(a(e),{hold_action:{...i.hold_action??{action:"dim"},entity:t}}),"Light to dim — optional",!1,p(i.hold_action.entity,i.entity))}</div>
                    <div class="ia-hint">Hold brightens; release and hold again darkens — it alternates each hold.</div>`:Y}

                  <span class="ia-lbl">Double tap</span>
                  <select class="inline-text"
                    @change=${t=>{const i=t.target.value;n(a(e),{double_tap_action:"none"===i?void 0:{action:i}})}}>
                    <option value="none" ?selected=${"none"===(l?.action??"none")}>— nothing —</option>
                    ${c?q`<option value="press" ?selected=${"press"===l?.action}>Replay a double push</option>`:Y}
                    <option value="perform-action" ?selected=${"perform-action"===l?.action}>Run script / service</option>
                    <option value="toggle" ?selected=${"toggle"===l?.action}>Toggle entity</option>
                  </select>
                  ${"perform-action"===l?.action?q`
                    <span class="ia-lbl">Service</span>
                    <input type="text" class="inline-text" placeholder="light.turn_on"
                      .value=${l.perform_action??""}
                      @change=${t=>n(a(e),{double_tap_action:{...l,perform_action:t.target.value.trim()||void 0}})}/>`:"toggle"===l?.action?q`
                    <span class="ia-lbl">Toggles</span>
                    <div>${d(l.entity,t=>n(a(e),{double_tap_action:{...l,entity:t}}),"Entity to toggle — optional",!0,p(l.entity,i?.entity))}</div>`:Y}
                  ${l&&"none"!==l.action?q`
                    <div class="ia-hint">A double tap delays the single tap by ~250ms on this channel so the two can be told apart.</div>`:Y}

                  ${this._advanced?q`
                    <span class="ia-lbl">Dropdown</span>
                    <div>${d(i?.select_chip?.entity,t=>{const i=(e=>Array.isArray(e)?e[0]:e)(t);n(a(e),{select_chip:i?{entity:i}:void 0})},"A select entity — WLED presets, say (optional)",!1)}</div>`:Y}
                </div>`:Y}
            </div>`})}
      </div>`}_renderRoomChromeBody(e){const t=this._config.area_styles?.[e]??{},i=(i,s,o)=>{const a=t[s]??o;return q`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${a}"></div>
          <span class="color-key">${i}</span>
          ${this._wheelButton(a,t=>this._setAreaStyle(e,s,t),i)}
          ${t[s]?q`<button class="color-reset" @click=${()=>this._setAreaStyle(e,s,void 0)}>↺</button>`:Y}
        </div>`},s=(i,s,o,a,n,r,l)=>{const c=t[s]??r;return q`
        <div class="sl-row">
          <span class="color-key">${i}</span>
          <input type="range" min="${o}" max="${a}" step="${n}" style="flex:1;accent-color:#f4601e"
            .value=${String(c)}
            @input=${t=>this._setAreaStyle(e,s,parseInt(t.target.value,10))}/>
          <span class="sl-val">${c}${l}</span>
        </div>`},o=(i,s,o,a)=>{const n=t[s]??a;return q`
        <div class="field">
          <div class="field-lbl">${i}${void 0!==t[s]?q`<button class="color-reset" style="margin-left:6px" @click=${()=>this._setAreaStyle(e,s,void 0)}>↺</button>`:Y}</div>
          <div class="pill-grp">
            ${o.map(([t,i])=>q`
              <span class="pill ${n===t?"on":""}"
                @click=${()=>this._setAreaStyle(e,s,t===a?void 0:t)}>${i}</span>`)}
          </div>
        </div>`},a=e=>q`<div class="rsp-section-lbl">${e}</div>`;return q`
      <div class="rsp-panel">
        ${a("Layout")}
        ${s("Tile gap","tileGap",4,24,2,10,"px")}

        ${this._renderBgImagePicker("Room background photo",`room-bg-${e}`,t.bg_image,t.bg_image_size,t=>this._setAreaStyle(e,"bg_image",t),t=>this._setAreaStyle(e,"bg_image_size",t),()=>["bg_image","bg_image_size","bg_image_mode","bg_image_pos"].forEach(t=>this._setAreaStyle(e,t,void 0)),{maxDim:1600,showFit:"sharp"===(t.bg_image_mode??"sharp"),extra:q`
              <div class="field-lbl" style="margin-top:8px">Backdrop mode
                <span class="dev-style-hint">a room section is a wide strip</span></div>
              <div class="pill-grp">
                ${[["Sharp","sharp"],["Ambient","ambient"]].map(([i,s])=>q`
                  <span class="pill ${(t.bg_image_mode??"sharp")===s?"on":""}"
                    @click=${()=>this._setAreaStyle(e,"bg_image_mode","sharp"===s?void 0:s)}>${i}</span>`)}
              </div>
              ${"sharp"===(t.bg_image_mode??"sharp")?q`
                <div class="field-lbl" style="margin-top:6px">Show which part</div>
                <div class="pill-grp">
                  ${[["Top","top"],["Center","center"],["Bottom","bottom"]].map(([i,s])=>q`
                    <span class="pill ${(t.bg_image_pos??"center")===s?"on":""}"
                      @click=${()=>this._setAreaStyle(e,"bg_image_pos","center"===s?void 0:s)}>${i}</span>`)}
                </div>`:Y}`})}

        ${a("Tile appearance")}
        ${i("Tile background","tileBgColor","#1c1c1e")}
        ${this._adv(q`
        ${i("Room block background","bgColor","transparent")}
        ${s("Room block opacity","bgOpacity",0,100,1,100,"%")}
        ${i("Tile border","tileBorderColor","rgba(255,255,255,0.07)")}
        ${i("Tile text","tileTextColor","#f4f4f5")}
        ${s("Tile corner radius","tileBorderRadius",0,20,1,12,"px")}
        ${s("Tile opacity","tileOpacity",0,100,1,100,"%")}
        ${s("Room block border","borderWidth",0,8,1,1,"px")}
        ${i("Room block border colour","borderColor","rgba(255,255,255,0.07)")}
        ${o("Room block border style","borderStyle",[["solid","Solid"],["dashed","Dashed"],["dotted","Dotted"]],"solid")}
        ${s("Room block radius","borderRadius",0,32,2,10,"px")}
        ${o("Room block shadow","boxShadow",[["none","None"],["soft","Soft"],["medium","Medium"],["strong","Strong"]],"none")}

        ${a("Room header")}
        ${i("Gradient start","headerBgColor","#1a1a2e")}
        ${i("Gradient end","headerBgColor2","#0f3460")}
        ${o("Gradient direction","headerBgDir",[["to right","→"],["to bottom","↓"],["135deg","↘"],["to left","←"]],"to right")}
        ${i("Header text","textColor","#f4601e")}
        ${s("Font size","fontSize",8,32,1,12,"px")}
        ${o("Font weight","fontWeight",[["normal","Normal"],["bold","Bold"]],"bold")}
        ${o("Font style","fontStyle",[["normal","Normal"],["italic","Italic"]],"normal")}
        `)}

        ${a("Room header chips")}
        ${this._renderRoomHeaderChips(e,t)}

        ${this._adv(q`
        ${a("ON / OFF buttons")}
        ${(()=>{const i=t.buttonShape??"pill",s=t.buttonVariant??"fill",o=t.buttonSize??"md",a="square"===i||"circle"===i,n="pill"===i?"20px":"rect"===i||"square"===i?"6px":"50%",r=a?"sm"===o?"3px 5px":"lg"===o?"6px 12px":"4px 8px":"sm"===o?"2px 8px":"lg"===o?"6px 16px":"4px 12px",l="sm"===o?"10px":"lg"===o?"13px":"11px",c=a?"1":"auto",d=t.accentColor??"var(--accent)",p="outline"===s?`background:transparent;color:${d};border:1px solid ${d};box-shadow:none`:"ghost"===s?`background:transparent;color:${d};border:none;box-shadow:none`:`background:${d};color:white;border:none`,h=`border-radius:${n};padding:${r};font-size:${l};aspect-ratio:${c};display:inline-flex;align-items:center;justify-content:center;cursor:default;`,u=t.buttonShape||t.buttonVariant||t.buttonSize;return q`
            <div class="btn-preview">
              <span class="preview-btn on" style="${h}${p}">ON</span>
              <span class="preview-btn off" style="${h}background:rgba(255,255,255,.08);color:var(--t2);border:none">OFF</span>
              ${u?q`<button class="color-reset" style="margin-left:auto" @click=${()=>{this._setAreaStyle(e,"buttonShape",void 0),this._setAreaStyle(e,"buttonVariant",void 0),this._setAreaStyle(e,"buttonSize",void 0)}}>↺ Reset</button>`:Y}
            </div>
            <div class="field">
              <div class="field-lbl">Shape</div>
              <div class="pill-grp">
                ${["pill","rect","square","circle"].map(t=>q`
                  <span class="pill ${i===t?"on":""}"
                    @click=${()=>this._setAreaStyle(e,"buttonShape",t)}>
                    ${t[0].toUpperCase()+t.slice(1)}</span>`)}
              </div>
            </div>
            <div class="field">
              <div class="field-lbl">Variant</div>
              <div class="pill-grp">
                ${["fill","outline","ghost"].map(t=>q`
                  <span class="pill ${s===t?"on":""}"
                    @click=${()=>this._setAreaStyle(e,"buttonVariant",t)}>
                    ${t[0].toUpperCase()+t.slice(1)}</span>`)}
              </div>
            </div>
            <div class="field">
              <div class="field-lbl">Size</div>
              <div class="pill-grp">
                ${["sm","md","lg"].map((t,i)=>q`
                  <span class="pill ${o===t?"on":""}"
                    @click=${()=>this._setAreaStyle(e,"buttonSize",t)}>
                    ${["Small","Medium","Large"][i]}</span>`)}
              </div>
            </div>`})()}
        `)}
      </div>`}_updateView(e,t){const i=(this._config.views??[]).map(i=>i.id===e?{...i,...t}:i);this._set("views",i)}_updateViewFilter(e,t){const i=(this._config.views??[]).map(i=>{if(i.id!==e)return i;const s={...i.filter??{},...t};for(const e of Object.keys(s)){const t=s[e];(null==t||Array.isArray(t)&&0===t.length||"string"==typeof t&&""===t)&&delete s[e]}return{...i,filter:Object.keys(s).length?s:void 0}});this._set("views",i)}_toggleViewFilterValue(e,t,i){const s=(this._config.views??[]).find(t=>t.id===e),o=s?.filter?.[t]??[],a=o.includes(i)?o.filter(e=>e!==i):[...o,i];this._updateViewFilter(e,{[t]:a})}_addView(){const e=this._config.views??[];let t=e.length+1;for(;e.some(e=>e.id===`view_${t}`);)t++;const i={id:`view_${t}`,name:`View ${t}`};this._set("views",[...e,i]),this._flushConfig(),this._expandedViewIds=new Set([...this._expandedViewIds,i.id])}_regexError(e){if(!e)return null;try{return new RegExp(e),null}catch(e){return e.message}}_deleteView(e){const t=(this._config.views??[]).filter(t=>t.id!==e);this._set("views",t.length?t:void 0),this._config.default_view===e&&this._set("default_view",void 0),this._flushConfig()}_armDeleteView(e){if(clearTimeout(this._viewDeleteTimer),this._viewDeleteArmed===e)return this._viewDeleteArmed=null,void this._deleteView(e);this._viewDeleteArmed=e,this._viewDeleteTimer=setTimeout(()=>{this._viewDeleteArmed=null},3500)}_moveView(e,t){const i=[...this._config.views??[]],s=i.findIndex(t=>t.id===e);if(s<0)return;const o=s+t;o<0||o>=i.length||([i[s],i[o]]=[i[o],i[s]],this._set("views",i),this._flushConfig())}_countViewMatches(e,t,i){const s=e.filter;let o=t;if(!s)return o.length;if(s.profiles?.length){const e=new Set(s.profiles);o=o.filter(t=>{const s=i.get(t.device_id);return s&&e.has(ei(s).type)})}if(s.domains?.length){const e=new Set(s.domains);o=o.filter(t=>i.get(t.device_id)?.entities.some(t=>e.has(t.domain)))}if(s.areas?.length){const e=new Set(s.areas.map(e=>e.toLowerCase()));o=o.filter(t=>e.has((t.area??"").toLowerCase()))}if(s.devices?.length){const e=new Set(s.devices);o=o.filter(t=>e.has(t.device_id))}if(s.exclude_devices?.length){const e=new Set(s.exclude_devices);o=o.filter(t=>!e.has(t.device_id))}if(s.entity_id_pattern)try{const e=new RegExp(s.entity_id_pattern);o=o.filter(t=>i.get(t.device_id)?.entities.some(t=>e.test(t.entity_id)))}catch{}return o.length}_renderViewsTab(){const e=this._config.views??[],t=["relay","plug","dimmer","rgb","climate","wall_display","cover","valve","energy","sensor","input","uni"],i=["light","switch","sensor","binary_sensor","climate","cover","valve","button","select","number"],s=this._getAreas(),o=this._getDiscoveredDevices(),a=new Map(this._allDevices().map(e=>[e.device_id,e]));return q`
      <div class="views-header">
        <div style="color:var(--t2);font-size:12px">
          Views let you swap between filtered dashboards — e.g. Overview, Energy, Lights. Favourites are shown only on views with <b>Show favourites</b> enabled.
        </div>
        <button class="btn-copy" @click=${()=>this._addView()}>+ Add view</button>
      </div>

      ${0===e.length?q`
        <div class="empty-views">
          <div>No views configured.</div>
          <div style="font-size:11px;margin-top:4px;color:var(--t3)">Without views, the card renders all devices in a single layout. Add a view to enable the tab bar.</div>
        </div>
      `:q`
        <div class="field" style="padding:6px 0">
          <div class="field-lbl">Default view (selected on first load)</div>
          <div class="pill-grp">
            ${e.map(t=>q`
              <span class="pill ${(this._config.default_view??e[0].id)===t.id?"on":""}"
                @click=${()=>this._set("default_view",t.id===e[0].id?void 0:t.id)}>${t.name||t.id}</span>`)}
          </div>
        </div>
      `}

      ${e.map((n,r)=>this._renderViewCard(n,r,e.length,t,i,s,o,a))}
    `}_renderViewCard(e,t,i,s,o,a,n,r){const l=this._expandedViewIds.has(e.id),c=e.filter??{},d=new Set(c.devices??[]),p=new Set(c.exclude_devices??[]),h=this._countViewMatches(e,n,r),u=n.length,g=(t,i)=>this._updateView(e.id,{[t]:i});return q`
      <div class="view-card ${l?"expanded":""}">
        <div class="view-card-hdr" @click=${()=>{const t=new Set(this._expandedViewIds);l?t.delete(e.id):t.add(e.id),this._expandedViewIds=t}}>
          <span class="view-card-icon">${e.icon?q`<ha-icon .icon=${e.icon}></ha-icon>`:"☰"}</span>
          <span class="view-card-name">${e.name||e.id}</span>
          <span class="view-card-id">#${e.id}</span>
          <span class="view-card-count" title="Devices matching this view's filter">${h}/${u}</span>
          <div class="view-card-actions" @click=${e=>e.stopPropagation()}>
            <button class="vc-btn" ?disabled=${0===t}           title="Move up"   @click=${()=>this._moveView(e.id,-1)}>▲</button>
            <button class="vc-btn" ?disabled=${t===i-1}   title="Move down" @click=${()=>this._moveView(e.id,1)}>▼</button>
            <button class="vc-btn danger ${this._viewDeleteArmed===e.id?"armed":""}"
              title=${this._viewDeleteArmed===e.id?`Delete "${e.name}"?`:"Delete view"}
              @click=${()=>this._armDeleteView(e.id)}>${this._viewDeleteArmed===e.id?"Delete?":"🗑"}</button>
          </div>
          <span class="view-card-chev">${l?"▲":"▼"}</span>
        </div>

        ${l?q`
          <div class="view-card-body">
            <!-- Identity -->
            ${this._adv(q`
            <div class="field">
              <div class="field-lbl">ID (used in URL / localStorage)</div>
              <input type="text" class="inline-text" .value=${e.id}
                @change=${t=>{const i=t.target.value.trim();if(i&&i!==e.id)if((this._config.views??[]).some(e=>e.id===i))alert("ID already in use");else{this._updateView(e.id,{id:i}),this._config.default_view===e.id&&this._set("default_view",i);{const t=new Set(this._expandedViewIds);t.delete(e.id),t.add(i),this._expandedViewIds=t}}}}/>
            </div>`)}
            <div class="field">
              <div class="field-lbl">Name (tab label)</div>
              <input type="text" class="inline-text" .value=${e.name}
                @input=${e=>g("name",e.target.value)}/>
            </div>
            <div class="field">
              <div class="field-lbl">Icon (mdi:*)</div>
              <input type="text" class="inline-text" placeholder="mdi:home" .value=${e.icon??""}
                @change=${e=>{const t=e.target.value.trim();g("icon",t||void 0)}}/>
            </div>

            <!-- Gating -->
            <div class="tog-row" style="border:none;padding:4px 0 0">
              <div class="tog-lbl">Show Favourites section</div>
              <label class="sw"><input type="checkbox" .checked=${!0===e.show_favourites}
                @change=${e=>g("show_favourites",!!e.target.checked||void 0)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>
            <div class="tog-row" style="border:none;padding:4px 0 0">
              <div class="tog-lbl">Group by room</div>
              <label class="sw"><input type="checkbox" .checked=${!1!==e.show_rooms}
                @change=${e=>g("show_rooms",!!e.target.checked&&void 0)}>
                <span class="sw-t"></span><span class="sw-b"></span></label>
            </div>

            <!-- Filter -->
            <div class="subgroup-lbl" style="margin-top:10px">Filter (empty = all devices)</div>

            <div class="field">
              <div class="field-lbl">Profiles
                ${this._selAllNone(()=>this._updateViewFilter(e.id,{profiles:[...s]}),()=>this._updateViewFilter(e.id,{profiles:[]}))}</div>
              <div class="pill-grp">
                ${s.map(t=>q`
                  <span class="pill ${(c.profiles??[]).includes(t)?"on":""}"
                    @click=${()=>this._toggleViewFilterValue(e.id,"profiles",t)}>${t}</span>`)}
              </div>
            </div>

            ${this._adv(q`
            <div class="field">
              <div class="field-lbl">Entity domains
                ${this._selAllNone(()=>this._updateViewFilter(e.id,{domains:[...o]}),()=>this._updateViewFilter(e.id,{domains:[]}))}</div>
              <div class="pill-grp">
                ${o.map(t=>q`
                  <span class="pill ${(c.domains??[]).includes(t)?"on":""}"
                    @click=${()=>this._toggleViewFilterValue(e.id,"domains",t)}>${t}</span>`)}
              </div>
            </div>`)}

            ${a.length?q`
              <div class="field">
                <div class="field-lbl">Areas
                  ${this._selAllNone(()=>this._updateViewFilter(e.id,{areas:a.map(e=>e.name)}),()=>this._updateViewFilter(e.id,{areas:[]}))}</div>
                <div class="pill-grp">
                  ${a.map(t=>q`
                    <span class="pill ${(c.areas??[]).includes(t.name)?"on":""}"
                      @click=${()=>this._toggleViewFilterValue(e.id,"areas",t.name)}>${t.name}</span>`)}
                </div>
              </div>`:Y}

            <div class="field">
              <div class="field-lbl">Include specific devices (overrides profiles/domains filter — AND with other gates)</div>
              <div class="view-dev-list">
                ${Oe(n,e=>e.device_id,t=>q`
                  <label class="view-dev-row">
                    <input type="checkbox" .checked=${d.has(t.device_id)}
                      @change=${()=>this._toggleViewFilterValue(e.id,"devices",t.device_id)}>
                    <span class="view-dev-name">${t.name}</span>
                    ${t.area?q`<span class="view-dev-area">${t.area}</span>`:Y}
                  </label>`)}
              </div>
            </div>

            <div class="field">
              <div class="field-lbl">Exclude devices</div>
              <div class="view-dev-list">
                ${Oe(n,e=>e.device_id,t=>q`
                  <label class="view-dev-row">
                    <input type="checkbox" .checked=${p.has(t.device_id)}
                      @change=${()=>this._toggleViewFilterValue(e.id,"exclude_devices",t.device_id)}>
                    <span class="view-dev-name">${t.name}</span>
                    ${t.area?q`<span class="view-dev-area">${t.area}</span>`:Y}
                  </label>`)}
              </div>
            </div>

            ${this._themeOverrideSelect(e.theme,e=>g("theme",e),"Repaints the whole card — header included — while this view is showing.\n               Overrides the card theme and any colour set in Design → Colours.")}

            ${this._adv(q`
            <div class="field">
              <div class="field-lbl">Entity-ID regex (optional)</div>
              <input type="text" class="inline-text ${this._regexError(c.entity_id_pattern)?"input-invalid":""}" placeholder="e.g. ^light\\..*"
                .value=${c.entity_id_pattern??""}
                @change=${t=>this._updateViewFilter(e.id,{entity_id_pattern:t.target.value||void 0})}/>
              ${this._regexError(c.entity_id_pattern)?q`<div class="input-err">Invalid regex: ${this._regexError(c.entity_id_pattern)}</div>`:Y}
            </div>`)}

            ${this._adv(q`
            <!-- Layout overrides -->
            <div class="subgroup-lbl" style="margin-top:10px">Layout &amp; style overrides (optional)</div>

            <div class="field">
              <div class="field-lbl">Tile style</div>
              <div class="pill-grp">
                ${["default","power-monitor","light-control","climate-control","cover-control","sensor-card","scene-button"].map(t=>q`
                  <span class="pill ${(e.tile_style??"default")===t?"on":""}"
                    @click=${()=>g("tile_style","default"===t?void 0:t)}>${t}</span>`)}
              </div>
            </div>
            ${"power-monitor"===e.tile_style?q`
              <div class="field">
                <div class="field-lbl">Power-monitor variant</div>
                <div class="pill-grp">
                  ${["big-number","gauge","graph","compact","table"].map(t=>q`
                    <span class="pill ${(e.power_monitor_variant??"big-number")===t?"on":""}"
                      @click=${()=>g("power_monitor_variant","big-number"===t?void 0:t)}>${t}</span>`)}
                </div>
              </div>`:Y}

            <div class="field">
              <div class="field-lbl">Columns — <span style="color:#f4601e">${e.columns??"inherit"}</span></div>
              <input type="range" min="1" max="6" step="1" .value=${String(e.columns??this._config.columns??3)}
                @input=${e=>g("columns",parseInt(e.target.value,10))}/>
              ${void 0!==e.columns?q`<button class="color-reset" @click=${()=>g("columns",void 0)}>↺</button>`:Y}
            </div>

            <div class="field">
              <div class="field-lbl">Tile size</div>
              <div class="pill-grp">
                ${["sm","md","lg"].map(t=>q`
                  <span class="pill ${(e.tile_size??"inherit")===t?"on":""}"
                    @click=${()=>g("tile_size",t)}>${t}</span>`)}
                <span class="pill ${void 0===e.tile_size?"on":""}"
                  @click=${()=>g("tile_size",void 0)}>inherit</span>
              </div>
            </div>

            <div class="field">
              <div class="field-lbl">Sort devices</div>
              ${this._pills(e.sort_by,[...ko,["inherit",void 0]],e=>g("sort_by",e))}
            </div>`)}
          </div>`:Y}
      </div>`}_gridBody(){const e=this._config;return q`
      <div class="field">
        <div class="field-lbl">Columns <span class="field-note">overridden per-room / per-view</span></div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>this._set("columns",Math.max(1,(e.columns??1)-1))}>−</button>
          <span class="step-val">${e.columns??1}</span>
          <button class="step-btn" @click=${()=>this._set("columns",Math.min(6,(e.columns??1)+1))}>+</button>
          <input type="range" min="1" max="6" step="1" style="flex:1;margin-left:8px"
            .value=${String(e.columns??1)}
            @input=${e=>this._set("columns",parseInt(e.target.value,10))}/>
        </div>
      </div>`}_layoutSectionDescriptors(){const e=this._config,t=e.style??{},i=(e,i)=>this._set("style",{...t,[e]:i}),s=e=>{const i={...t};delete i[e],this._set("style",i)},o=(e,o,a)=>{const n=t[o]??a;return q`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${n}"></div>
          <span class="color-key">${e}</span>
          ${this._wheelButton(String(n),e=>i(o,e))}
          ${t[o]?q`<button class="color-reset" @click=${()=>s(o)}>↺</button>`:Y}
        </div>`},a=(()=>{const e=new Map;for(const t of this._allDevices())for(const i of t.labels??[])e.set(i,(e.get(i)??0)+1);const t=this.hass?.labels;return[...e.entries()].map(([e,i])=>({id:e,n:i,name:t?.[e]?.name??e.replace(/_/g," ")})).sort((e,t)=>t.n-e.n||e.name.localeCompare(t.name))})(),n=new Set(e.light_labels??[]),r=q`
      <!-- Title -->
      <div class="field">
        <div class="field-lbl">Card title</div>
        <div style="display:flex;gap:6px">
          <input type="text" class="inline-text" placeholder="Shelly"
            .value=${e.title??""}
            @change=${e=>{const t=e.target.value.trim();this._set("title",t||void 0)}}
            style="flex:1"/>
          <input type="text" class="inline-text" placeholder="⚡" maxlength="4"
            title="Icon / emoji before title"
            .value=${t.header_icon??""}
            @change=${e=>{const t=e.target.value.trim();i("header_icon",t||void 0)}}
            style="width:48px;text-align:center;font-size:16px"/>
        </div>
      </div>
      ${this._adv(q`
      <!-- Appearance sliders -->
      <div class="field">
        <div class="field-lbl">Title size — <span style="color:#f4601e">${(t.header_title_size??1.1).toFixed(1)}em</span>${this._resetBtn(void 0!==t.header_title_size,()=>this._clearStyle("header_title_size"))}</div>
        <input type="range" min="0.7" max="1.8" step="0.1" .value=${String(t.header_title_size??1.1)}
          @input=${e=>{const t=parseFloat(e.target.value);i("header_title_size",1.1===t?void 0:t)}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Header height — <span style="color:#f4601e">${t.header_padding??16}px</span>${this._resetBtn(void 0!==t.header_padding,()=>this._clearStyle("header_padding"))}</div>
        <input type="range" min="6" max="40" step="2" .value=${String(t.header_padding??16)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_padding",16===t?void 0:t)}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Corner radius — <span style="color:#f4601e">${t.header_radius??0}px</span>${this._resetBtn(void 0!==t.header_radius,()=>this._clearStyle("header_radius"))}</div>
        <input type="range" min="0" max="24" step="2" .value=${String(t.header_radius??0)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_radius",0===t?void 0:t)}}/>
      </div>
      <!-- Bottom border/separator -->
      <div class="field">
        <div class="field-lbl">Bottom border — <span style="color:#f4601e">${t.header_border_width??0}px</span>${this._resetBtn(void 0!==t.header_border_width,()=>this._clearStyle("header_border_width"))}</div>
        <input type="range" min="0" max="6" step="1" .value=${String(t.header_border_width??0)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_border_width",0===t?void 0:t)}}/>
      </div>
      ${(t.header_border_width??0)>0?o("Border color","header_border_color","#4ade80"):Y}
      `)}
      <!-- Visibility toggles -->
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show the header
          <span class="field-note">off removes the bar entirely — turning off title and stats alone leaves an empty strip</span></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_header}
          @change=${e=>this._set("show_header",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Group by room
          <span class="field-note">off drops the room headings — a single-device card has nothing to group</span></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_rooms}
          @change=${e=>this._set("show_rooms",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show title</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_title}
          @change=${e=>this._set("header_show_title",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show stats (online / power)</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_stats}
          @change=${e=>this._set("header_show_stats",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${!1!==e.header_show_stats?q`
        <div class="field" style="margin:6px 0 2px">
          <div class="field-lbl" style="display:flex;align-items:center;gap:8px">
            Header chips
            ${e.header_chips?q`<button class="color-reset" @click=${()=>this._set("header_chips",void 0)}>↺ Default</button>`:Y}
          </div>
          <div class="pill-grp">
            ${Ci.map(t=>{const i=e.header_chips??$i,s=i.includes(t.key);return q`
                <span class="pill ${s?"on":""}"
                  @click=${()=>{const e=s?i.filter(e=>e!==t.key):[...i,t.key],o=e.length===$i.length&&$i.every(t=>e.includes(t));this._set("header_chips",o?void 0:e)}}>${t.label}</span>`})}
          </div>
          <div class="hint" style="margin-top:4px">Each chip is clickable on the card and lists devices high → low.</div>
        </div>`:Y}
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show cloud chips (extra status row)</div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.header_show_cloud}
          @change=${e=>this._set("header_show_cloud",!!e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${this._adv(q`
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show glow orbs</div>
        <label class="sw"><input type="checkbox" .checked=${!0===(e.header_show_orbs??e.effects??!1)}
          @change=${e=>this._set("header_show_orbs",!!e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Ambient effects (pulse, glow, blur)</div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.effects}
          @change=${e=>this._set("effects",!!e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <!-- Background colors -->
      ${o("Background gradient start","header_bg","#1a1a2e")}
      ${o("Background gradient end","header_bg2","#0f3460")}
      ${o("Text color","header_text_color","#ffffff")}
      ${o("Orb / glow color","header_orb_color","#3b82f6")}
      <!-- Stat chip colors -->
      ${o("Online chip color","header_stat_online","#4ade80")}
      ${o("Power chip color","header_stat_power","#fb923c")}
      ${o("Offline chip color","header_stat_offline","#9ca3af")}
      <!-- Opacity -->
      <div class="field">
        <div class="field-lbl">Background opacity — <span style="color:#f4601e">${e.header_opacity??100}%</span>${this._resetBtn(void 0!==e.header_opacity,()=>this._clearCfg("header_opacity"))}</div>
        <input type="range" min="0" max="100" step="5" .value=${String(e.header_opacity??100)}
          @input=${e=>{const t=parseInt(e.target.value);this._set("header_opacity",100===t?void 0:t)}}/>
      </div>`)}`,l=(e,i,s)=>{const o=t[i]??s;return q`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${o}"></div>
          <span class="color-key">${e}</span>
          ${this._wheelButton(String(o),e=>this._set("style",{...t,[i]:e}))}
          ${t[i]?q`<button class="color-reset" @click=${()=>{const e={...t};delete e[i],this._set("style",e)}}>↺</button>`:Y}
        </div>`},c=q`
      ${l("Tile background","tile_bg","rgba(255,244,232,0.035)")}
      ${l("Tile border","tile_border","rgba(255,244,232,0.08)")}
      ${l("Tile hover BG","tile_hover_bg","rgba(255,244,232,0.06)")}
      ${l("Tile hover shadow","tile_hover_shadow","rgba(0,0,0,0.35)")}
      ${l("Sensor chip BG","tile_sensor_bg","rgba(255,244,232,0.045)")}
      ${l("Expanded panel BG","tile_exp_bg","rgba(255,244,232,0.05)")}`,d=q`
      <div class="subgroup-lbl">Brand</div>
      ${l("Accent / brand","accent_color","#c98a63")}
      ${l("Room header label","area_header_color","#c98a63")}

      <div class="subgroup-lbl">Text &amp; status</div>
      ${l("Text primary","text_primary","#ece5dc")}
      ${l("Text secondary","text_secondary","#b3a596")}
      ${l("Text muted","text_muted","#7e7265")}
      ${l("Online dot","online_color","#93b384")}
      ${l("Offline dot","offline_color","#d47f62")}
      ${l("Power reading","power_color","#dba25c")}`,p=t.font_family??"",h=q`
      <div class="field">
        <div class="field-lbl">Font family</div>
        <select class="font-select" style=${p?`font-family:${p}`:""}
          @change=${e=>{const i=e.target.value;if(i)this._set("style",{...t,font_family:i});else{const{font_family:e,...i}=t;this._set("style",Object.keys(i).length?i:void 0)}}}>
          ${["System","Bundled","Display"].map(e=>q`
            <optgroup label="${e}">
              ${Be.filter(t=>t.group===e).map(e=>q`
                <option .value=${e.value??""} ?selected=${(t.font_family??"")===(e.value??"")}
                  style="${e.value?`font-family:${e.value}`:""}">${e.label}</option>`)}
            </optgroup>`)}
        </select>
      </div>
      <div class="field">
        <div class="field-lbl">Text scale — <span style="color:#f4601e">${(t.text_size_scale??1).toFixed(2)}×</span>${this._resetBtn(void 0!==t.text_size_scale,()=>this._clearStyle("text_size_scale"))}</div>
        <input type="range" min="0.8" max="1.3" step="0.05" .value=${String(t.text_size_scale??1)}
          @input=${e=>this._set("style",{...t,text_size_scale:parseFloat(e.target.value)})}/>
      </div>
      </div>`,u=e.card_opacity??100,g=e.tile_opacity??100,v=q`
      ${this._gridBody()}
      <div class="tog-row" data-ctl="smart_tile_styles">
        <div class="tog-lbl">Smart tile styles
          <div class="hint">Auto-pick a layout per device type where you haven't set one — relay→power monitor, light→colour wheel, sensor→card.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.smart_tile_styles}
          @change=${e=>this._set("smart_tile_styles",e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row ${"delegate_controls"===this._flashControl?"ctl-flash":""}" data-ctl="delegate_controls">
        <div class="tog-lbl">Native controls
          <div class="hint">Show controls for fans, vacuums, locks and other devices this card doesn't draw itself, using Home Assistant's own tiles. Media players have the card's own Media controls block and don't need this. Off by default — each one embeds a native element, so it costs a little render time on big fleets.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.delegate_controls}
          @change=${e=>this._set("delegate_controls",e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Tile size</div>
        <div class="pill-grp">
          ${["sm","md","lg"].map((t,i)=>q`
            <span class="pill ${(e.tile_size??"md")===t?"on":""}" @click=${()=>this._set("tile_size",t)}>${["Small","Medium","Large"][i]}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile gap — <span style="color:#f4601e">${t.tile_gap??10}px</span>${this._resetBtn(void 0!==t.tile_gap,()=>this._clearStyle("tile_gap"))}</div>
        <input type="range" min="4" max="24" step="2" .value=${String(t.tile_gap??10)}
          @input=${e=>this._set("style",{...t,tile_gap:parseInt(e.target.value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile radius — <span style="color:#f4601e">${t.tile_radius??12}px</span>${this._resetBtn(void 0!==t.tile_radius,()=>this._clearStyle("tile_radius"))}</div>
        <input type="range" min="0" max="24" .value=${String(t.tile_radius??12)}
          @input=${e=>this._set("style",{...t,tile_radius:parseInt(e.target.value,10)})}/>
      </div>
      ${(()=>{const e=t.button_shape??"pill",i=t.button_variant??"fill",s=t.button_size??"md",o=(e,i,s)=>{const o={...t};i===s?delete o[e]:o[e]=i,this._set("style",o)},a=(e,t,i,s,a)=>q`
          <div class="field">
            <div class="field-lbl">${e}</div>
            <div class="pill-grp">
              ${i.map(([e,i])=>q`<span class="pill ${s===e?"on":""}" @click=${()=>o(t,e,a)}>${i}</span>`)}
            </div>
          </div>`;return q`
          <div class="tiles-divider">ON / OFF buttons <span class="dev-style-hint">card-wide — a room's own setting wins</span></div>
          ${a("Shape","button_shape",[["pill","Pill"],["rect","Rect"],["square","Square"],["circle","Circle"]],e,"pill")}
          ${a("Variant","button_variant",[["fill","Fill"],["outline","Outline"],["ghost","Ghost"]],i,"fill")}
          ${a("Size","button_size",[["sm","Small"],["md","Medium"],["lg","Large"]],s,"md")}`})()}
      <div class="tiles-divider">Power bar</div>
      <div class="tog-row">
        <div class="tog-lbl">Mini usage bar under each tile
          <span class="dev-style-hint">the adaptive tile's power_bar block</span></div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.show_power_bar}
          @change=${e=>this._set("show_power_bar",e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${e.show_power_bar?q`
      <div class="field">
        <div class="field-lbl">Full scale — <span style="color:#f4601e">${e.power_bar_max??2e3} W</span>${this._resetBtn(void 0!==e.power_bar_max,()=>this._clearCfg("power_bar_max"))}</div>
        <input type="range" min="100" max="5000" step="100" .value=${String(e.power_bar_max??2e3)}
          @input=${e=>this._set("power_bar_max",parseInt(e.target.value,10))}/>
      </div>`:Y}
      ${(()=>{const t=e.radio_stations??[],i=e=>this._set("radio_stations",e.length?e:void 0),s=(e,s)=>i(t.map((t,i)=>i===e?{...t,...s}:t));return q`
          <div class="tiles-divider">Radio stations
            <span class="dev-style-hint">shown as a dropdown on the media block — name and stream URL</span></div>
          ${t.map((e,o)=>q`
            <div class="rs-row">
              <input type="text" class="inline-text rs-name" placeholder="FM957" .value=${e.name}
                @change=${e=>s(o,{name:e.target.value.trim()})}/>
              <input type="text" class="inline-text rs-url" placeholder="https://…/stream.mp3" .value=${e.url}
                @change=${e=>s(o,{url:e.target.value.trim()})}/>
              <button class="color-reset" title="Remove" @click=${()=>i(t.filter((e,t)=>t!==o))}>✕</button>
            </div>`)}
          <button class="color-reset" style="margin-top:4px" @click=${()=>i([...t,{name:"",url:""}])}>+ Add station</button>
          <div class="dp-hint-inline">The dropdown also lists what the player itself offers — a Wall Display's radio favourites (star a station on the display), a receiver's presets. These streams are extras on top of that.</div>`})()}
      ${this._adv(q`
      <div class="field">
        <div class="field-lbl">Tile border width — <span style="color:#f4601e">${t.tile_border_width??1}px</span>${this._resetBtn(void 0!==t.tile_border_width,()=>this._clearStyle("tile_border_width"))}</div>
        <input type="range" min="0" max="4" step="1" .value=${String(t.tile_border_width??1)}
          @input=${e=>{const i=parseInt(e.target.value);this._set("style",{...t,tile_border_width:1===i?void 0:i})}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile shadow</div>
        <div class="pill-grp">
          ${["none","soft","medium","strong"].map(e=>q`
            <span class="pill ${(t.tile_box_shadow??"none")===e?"on":""}"
              @click=${()=>this._set("style",{...t,tile_box_shadow:"none"===e?void 0:e})}>
              ${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="tiles-divider">Tile background image</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="tile-bg"
            @change=${e=>this._handleTileBgUpload(e)}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector('input[data-upload="tile-bg"]')?.click()}}>↑ Local</button>
          ${t.tile_bg_image?this._renderBgThumb(t.tile_bg_image):Y}
          ${t.tile_bg_image?.startsWith("data:")?q`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(t.tile_bg_image)}</span>`:q`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${t.tile_bg_image??""}
                @change=${e=>{const i=e.target.value.trim(),s={...t};i?s.tile_bg_image=i:delete s.tile_bg_image,this._set("style",Object.keys(s).length?s:void 0)}}/>`}
          ${t.tile_bg_image?q`<button class="color-reset" @click=${()=>{const e={...t};delete e.tile_bg_image,delete e.tile_bg_image_size,this._set("style",Object.keys(e).length?e:void 0)}}>↺</button>`:Y}
        </div>
        ${t.tile_bg_image?q`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(e=>q`
              <span class="pill ${(t.tile_bg_image_size??"cover")===e?"on":""}"
                @click=${()=>this._set("style",{...t,tile_bg_image_size:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
          </div>
        `:Y}
      </div>
      <div class="tiles-divider">Tile colours</div>
      ${c}
      `)}
    `,f=q`
      <div class="tog-row">
        <div class="tog-lbl">Needs attention
          <div class="hint">A summary above the rooms listing offline devices, firing alerts, flat batteries and pending updates. It only appears when something qualifies.</div>
        </div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_attention}
          @change=${e=>this._set("show_attention",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      ${!1!==e.show_attention?q`
        <div class="field">
          <div class="field-lbl">Flag a battery at or below — <span style="color:#f4601e">${e.attention_battery??20}%</span>${this._resetBtn(void 0!==e.attention_battery,()=>this._clearCfg("attention_battery"))}</div>
          <input type="range" min="5" max="50" step="5" .value=${String(e.attention_battery??20)}
            @input=${e=>{const t=parseInt(e.target.value,10);this._set("attention_battery",20===t?void 0:t)}}/>
        </div>
        <div class="tog-row">
          <div class="tog-lbl">Count beta firmware
            <div class="hint">Shelly devices offer a beta build almost permanently. Off by default, so “needs update” means a release you would actually install.</div>
          </div>
          <label class="sw"><input type="checkbox" .checked=${!0===e.include_beta_updates}
            @change=${e=>this._set("include_beta_updates",e.target.checked||void 0)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
        <div class="tog-row">
          <div class="tog-lbl">Firmware spread
            <div class="hint">Inside that summary, group the fleet by firmware version so you can see what is lagging. Hidden when everything is on one version.</div>
          </div>
          <label class="sw"><input type="checkbox" .checked=${!1!==e.show_firmware_summary}
            @change=${e=>this._set("show_firmware_summary",!!e.target.checked&&void 0)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>`:Y}
      ${l("Dashboard background","card_bg","#1e1a17")}
      <div class="field">
        <div class="field-lbl">Card corner radius — <span style="color:#f4601e">${t.card_radius??12}px</span>${this._resetBtn(void 0!==t.card_radius,()=>this._clearStyle("card_radius"))}</div>
        <input type="range" min="0" max="32" step="2" .value=${String(t.card_radius??12)}
          @input=${e=>{const i=parseInt(e.target.value);this._set("style",{...t,card_radius:12===i?void 0:i})}}/>
      </div>
      <div class="tiles-divider">Transparency</div>
      <div class="field">
        <div class="field-lbl">Card — <span style="color:#f4601e">${100-u}%</span>${this._resetBtn(void 0!==e.card_opacity,()=>this._clearCfg("card_opacity"))}</div>
        <input type="range" min="0" max="100" .value=${String(100-u)}
          @input=${e=>this._set("card_opacity",100-parseInt(e.target.value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tiles — <span style="color:#f4601e">${100-g}%</span>${this._resetBtn(void 0!==e.tile_opacity,()=>this._clearCfg("tile_opacity"))}</div>
        <input type="range" min="0" max="100" .value=${String(100-g)}
          @input=${e=>this._set("tile_opacity",100-parseInt(e.target.value,10))}/>
      </div>
      <div class="tiles-divider">Card background image</div>
      <div class="field">
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="card-bg"
            @change=${e=>this._handleCardBgUpload(e)}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector('input[data-upload="card-bg"]')?.click()}}>↑ Local</button>
          ${e.card_bg_image?this._renderBgThumb(e.card_bg_image):Y}
          ${e.card_bg_image?.startsWith("data:")?q`<span class="bg-embedded-note">Embedded · ${this._estimateImageSize(e.card_bg_image)}</span>`:q`<input type="text" class="inline-text" placeholder="/local/image.png or https://…"
                .value=${e.card_bg_image??""}
                @change=${e=>{const t=e.target.value.trim();t?this._set("card_bg_image",t):this._set("card_bg_image",void 0)}}/>`}
          ${e.card_bg_image?q`<button class="color-reset" @click=${()=>{const e={...this._config};delete e.card_bg_image,delete e.card_bg_image_size,this._emitNow(e)}}>↺</button>`:Y}
        </div>
        ${e.card_bg_image?q`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(t=>q`
              <span class="pill ${(e.card_bg_image_size??"cover")===t?"on":""}"
                @click=${()=>this._set("card_bg_image_size",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
          </div>
        `:Y}
      </div>`,m=q`
      <div class="hint" style="margin-bottom:8px">
        The <b>Lights</b> chip counts <code>light</code> entities. Home Assistant has no
        idea a relay or plug is wired to a lamp — tick the labels you use for those, or
        name the entities directly.
      </div>
      ${a.length?q`
        <div class="field-lbl">Labels that mean “this drives a light”</div>
        <div class="pill-grp" style="margin-bottom:10px">
          ${a.map(e=>q`
            <span class="pill ${n.has(e.id)?"on":""}"
              title=${`${e.n} device${e.n>1?"s":""} carry this label`}
              @click=${()=>{const t=new Set(n);t.has(e.id)?t.delete(e.id):t.add(e.id),this._set("light_labels",t.size?[...t]:void 0)}}>${e.name} <span style="opacity:.55">${e.n}</span></span>`)}
        </div>`:q`<div class="hint" style="margin-bottom:10px">No device labels found — add them in Home Assistant under Settings → Areas &amp; labels, then tick them here.</div>`}
      <div class="field">
        <div class="field-lbl">Extra entities to count</div>
        <input type="text" class="inline-text" style="width:100%"
          placeholder="switch.hall_relay, switch.lamp — comma separated"
          .value=${(e.light_entities??[]).join(", ")}
          @change=${e=>{const t=e.target.value.split(",").map(e=>e.trim()).filter(Boolean);this._set("light_entities",t.length?t:void 0)}}/>
        <div class="hint" style="margin-top:2px">For anything a label does not cover.</div>
      </div>`,b=q`
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Collapse / expand all rooms
          <span class="dev-style-hint">a button above the first room; only when rooms are grouped</span></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_collapse_all}
          @change=${e=>this._set("show_collapse_all",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`,y=q`
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Entity list in the detail sheet
          <span class="dev-style-hint">every entity on the device, with toggles; hidden_entities trims it row by row</span></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_entity_list}
          @change=${e=>this._set("show_entity_list",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`,x=q`
      ${b}
      ${y}
      <div class="field-lbl">Room header chips</div>
      ${this._renderGlobalRoomHeaderChips()}
      <div class="field" style="margin-top:8px">
        <div class="field-lbl">Energy shows</div>
        ${this._renderEnergyPeriodPicker(e.energy_period,e=>this._set("energy_period","total"===e?void 0:e))}
      </div>
      <div class="field-lbl" style="margin-top:8px">Sensor chips</div>
      ${this._chipPicker(e.sensors,void 0,"the default (all shown)",e=>this._set("sensors",e))}`,w=q`
      <div class="snap-row" style="justify-content:flex-end;margin-bottom:6px">
        ${this._themeActions()}
      </div>
      ${this._renderThemeGrid()}
      <div class="hint" style="margin-top:8px">
        The card's palette. A view or a room can carry a theme of its own on top
        — Views tab, and Per-room styling below — and rooms and devices can
        override individual colours; Colours does that for the whole card.
      </div>`;return{theme:{icon:"🎨",bg:"rgba(244,96,30,0.1)",fg:"#f4601e",label:"Colour theme",badge:Y,body:w},header:{icon:"◈",bg:"rgba(99,102,241,0.1)",fg:"#818cf8",label:"Header",badge:Y,body:r},lights:{icon:"💡",bg:"rgba(251,191,36,0.1)",fg:"#fbbf24",label:"What counts as a light",badge:Y,body:m},content:{icon:"◫",bg:"rgba(244,96,30,0.1)",fg:"#f4601e",label:"Chips & metrics",badge:Y,body:x},tiles:{icon:"⊡",bg:"rgba(45,212,191,0.1)",fg:"#2dd4bf",label:"Tiles",badge:Y,body:v},card:{icon:"▢",bg:"rgba(129,140,248,0.1)",fg:"#818cf8",label:"Card",badge:Y,body:f},colors:{icon:"◐",bg:"rgba(244,96,30,0.12)",fg:"#f4601e",label:"Colours",badge:Y,body:d},typography:{icon:"T",bg:"rgba(251,191,36,0.1)",fg:"#fbbf24",label:"Typography",badge:Y,body:h}}}_globalSectionDescriptors(){return{...this._layoutSectionDescriptors(),...this._graphSectionDescriptors(),...this._sensorSectionDescriptors()}}_renderCustomTab(e){const t=new Set(["electrical","environmental","deviceinfo","alerts"]);return this._renderTabSections(e,this._globalSectionDescriptors(),(e,i)=>{const s=[...i].some(e=>t.has(e));return t.has(e)&&!s?q`<div class="hint" style="margin:4px 2px 8px">Global default — override per room (Layout & Style → room) or per device (Rooms & devices).</div>`:Y})}_graphSectionDescriptors(){const e=this._config,t=e.graph_style??{},i=t.type??"line",s=e.graph_sensor_colors??{},o=e.graph_sensors??Nt,a=q`
      <div class="tog-row" style="border:none;padding:0 0 6px">
        <div class="tog-lbl">Show graphs on tiles
          <span class="field-note">master switch — “Which sensors” below is the palette</span></div>
        <label class="sw"><input type="checkbox" .checked=${!0===e.show_graphs}
          @change=${e=>this._set("show_graphs",!!e.target.checked||void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Type</div>
        <div class="pill-grp">
          ${["line","area","bar"].map(e=>q`
            <span class="pill ${i===e?"on":""}" @click=${()=>this._set("graph_style",{...t,type:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field" style="margin-top:10px">
        <div class="field-lbl">Which sensors to graph
          ${this._selAllNone(()=>this._set("graph_sensors",ys(o,wi.map(e=>e.key))),()=>this._set("graph_sensors",[]))}</div>
        <div class="pill-grp">
          ${wi.map(e=>{const t=o.some(t=>Ai(t)===e.key);return q`
            <span class="pill ${t?"on":""}" @click=${()=>{const i=t?o.filter(t=>Ai(t)!==e.key):[...o,e.key];this._set("graph_sensors",i)}}>${e.label}</span>`})}
        </div>
        <div class="chip-picker-ents" style="margin-top:8px">
          <div class="chip-picker-grp-lbl">⌗ Specific entities</div>
          ${this._entityField(ms(o),e=>{const t=Array.isArray(e)?e:e?[e]:[];this._set("graph_sensors",[...fs(o),...t])},{deviceEntities:[],scopeAll:!0,placeholder:"sensor.davidpc_cpuload",multi:!0,note:"Plots readings with no device class. Drawn first, in the order added, and only on the device that owns them."})}
        </div>
      </div>
      ${this._adv(q`
      <div class="field" style="opacity:${"bar"===i?.4:1}">
        <div class="field-lbl">Line thickness — <span style="color:#f4601e">${t.line_width??1.5}px</span>${this._resetBtn(void 0!==t.line_width,()=>this._clearGraphStyle("line_width"))}</div>
        <input type="range" min="0.5" max="4" step="0.5" ?disabled=${"bar"===i} .value=${String(t.line_width??1.5)}
          @input=${e=>this._set("graph_style",{...t,line_width:parseFloat(e.target.value)})}/>
      </div>
      <div class="field" style="opacity:${"bar"===i?1:.4}">
        <div class="field-lbl">Bar corner radius — <span style="color:#f4601e">${t.bar_radius??1.5}px</span>${this._resetBtn(void 0!==t.bar_radius,()=>this._clearGraphStyle("bar_radius"))}</div>
        <input type="range" min="0" max="6" step="0.5" ?disabled=${"bar"!==i} .value=${String(t.bar_radius??1.5)}
          @input=${e=>this._set("graph_style",{...t,bar_radius:parseFloat(e.target.value)})}/>
      </div>
      <div class="color-row">
        <div class="color-preview-swatch" style="background:${e.graph_line_color??"#f4601e"}"></div>
        <span class="color-key">Fallback line colour <span class="dev-style-hint">sensors with no colour of their own</span></span>
        ${this._wheelButton(e.graph_line_color??"#f4601e",e=>this._set("graph_line_color",e),"Fallback line colour")}
        ${e.graph_line_color?q`<button class="color-reset" @click=${()=>this._clearCfg("graph_line_color")}>↺</button>`:Y}
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Fill area under line</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.fill} @change=${e=>this._set("graph_style",{...t,fill:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Graph height — <span style="color:#f4601e">${t.height??32}px</span>${this._resetBtn(void 0!==t.height,()=>this._clearGraphStyle("height"))}</div>
        <input type="range" min="20" max="80" step="4" .value=${String(t.height??32)}
          @input=${e=>this._set("graph_style",{...t,height:parseInt(e.target.value,10)})}/>
      </div>`)}
      <div class="field">
        <div class="field-lbl">History window — <span style="color:#f4601e">${e.graph_hours??24}h</span>${this._resetBtn(void 0!==e.graph_hours,()=>this._clearCfg("graph_hours"))}</div>
        <input type="range" min="1" max="168" step="1" .value=${String(e.graph_hours??24)}
          @input=${e=>this._set("graph_hours",parseInt(e.target.value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Energy shows${this._resetBtn(void 0!==e.energy_period,()=>this._clearCfg("energy_period"))}</div>
        ${this._renderEnergyPeriodPicker(e.energy_period,e=>this._set("energy_period","total"===e?void 0:e))}
        <div class="hint" style="margin-top:4px">Total = lifetime meter reading. Today/Week/Month = consumption this period (from HA statistics). Applies to every Energy chip; override per room or device.</div>
      </div>
      ${this._adv(q`
      <div class="tog-row">
        <div class="tog-lbl">Show time axis labels</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.time_labels} @change=${e=>this._set("graph_style",{...t,time_labels:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show peak / min dots</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.show_dots} @change=${e=>this._set("graph_style",{...t,show_dots:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Tick grid lines</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.tick_lines} @change=${e=>this._set("graph_style",{...t,tick_lines:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`)}`,n=t.gauge_gradients??{},r=(e,i)=>{const s={...n};i?s[e]=i:delete s[e],this._set("graph_style",{...t,gauge_gradients:Object.keys(s).length?s:void 0})},l=(e,t)=>{const i={...s};t?i[e]=t:delete i[e],this._set("graph_sensor_colors",Object.keys(i).length?i:void 0)},c=e=>{const i=wi.find(t=>t.key===e.key),o=i?.label??e.key,a=n[e.key],c=s[e.key],d=Yt(e.key,{colors:s,gradients:n,accent:"#f4601e"}),p=d.length>1,h=t.sensor_ranges?.[e.key]??{},u=h.min??e.min,g=h.max??e.max,v=t=>`${Number.isInteger(t)?t:t.toFixed(1)} ${e.label}`,f=e=>p?3===d.length?[v(u),v((u+g)/2),v(g)][e]:[v(u),v(g)][e]:"Colour";return q`
        <div class="gg-row">
          <div class="gg-hdr">
            <span class="color-key">${o} <span class="dev-style-hint">${e.label}</span></span>
            <div class="pill-grp">
              <span class="pill ${p?"":"on"}" @click=${()=>{p&&(r(e.key,void 0),l(e.key,d[d.length-1]))}}>Flat</span>
              <span class="pill ${p?"on":""}" @click=${()=>{p||(l(e.key,void 0),r(e.key,e.stops??[d[0],"#fde047","#f87171"]))}}>Gradient</span>
            </div>
            ${p?q`<button class="color-reset" title=${3===d.length?"Drop the middle stop":"Add a middle stop"}
              @click=${3===d.length?()=>r(e.key,[d[0],d[2]]):()=>r(e.key,[d[0],Vt(d,.5),d[1]])}>${3===d.length?"− mid":"+ mid"}</button>`:Y}
            ${a||c?q`<button class="color-reset" title="Back to the default"
              @click=${()=>{r(e.key,void 0),l(e.key,void 0)}}>↺</button>`:Y}
          </div>
          <div class="gg-bar" style="background:${p?`linear-gradient(to right, ${d.join(", ")})`:d[0]}"></div>
          <div class="gg-stops ${p?"":"single"}">
            ${d.map((t,i)=>q`
              <span class="gg-stop">
                ${this._wheelButton(t,t=>((t,i)=>{if(p){const s=[...d];s[t]=i,r(e.key,s)}else l(e.key,i)})(i,t),f(i))}
                <span>${f(i)}</span>
              </span>`)}
          </div>
        </div>`},d=(e,t,i)=>{const o=s[e]??i,a=!!s[e];return q`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${o}"></div>
          <span class="color-key">${t}</span>
          ${this._wheelButton(o,t=>this._set("graph_sensor_colors",{...s,[e]:t}),t)}
          ${a?q`<button class="color-reset" @click=${()=>{const t={...s};delete t[e],this._set("graph_sensor_colors",Object.keys(t).length?t:void 0)}}>↺</button>`:Y}
        </div>`},p=q`
      <div class="field-lbl" style="margin-bottom:6px">Gauge ring &amp; sparkline colours
        <span class="dev-style-hint">one colour per sensor: a gradient runs along the arc from the empty end to the full end, the value label takes the colour at the reading, and the sparkline takes the middle of it</span></div>
      ${Ht.map(e=>c(e))}
      ${o.filter(e=>!Ht.find(t=>t.key===e)).length?q`
        <div class="field-lbl" style="margin:10px 0 6px">Sparkline colours
          <span class="dev-style-hint">sensors with no gauge ring</span></div>
        ${o.filter(e=>!Ht.find(t=>t.key===e)).map(e=>{const t=wi.find(t=>t.key===e);return d(e,t?.label??e,(e=>s[e]??wi.find(t=>t.key===e)?.defaultColor??"#f4601e")(e))})}`:Y}
`,h=t.sensor_ranges??{},u=(e,i,s)=>{const o=""===s.trim()?void 0:parseFloat(s),a={...h[e]??{}};void 0===o||isNaN(o)?delete a[i]:a[i]=o;const n={...h,[e]:a};a.min||0===a.min||a.max||0===a.max||delete n[e],this._set("graph_style",{...t,sensor_ranges:Object.keys(n).length?n:void 0})},g=q`
      <div style="font-size:10px;color:var(--t3);margin-bottom:8px">
        Controls y-axis in sparklines and needle positions in the gauge. Leave empty to auto-scale.
      </div>
      <div class="range-table">
        <div class="range-hdr"><span>Sensor</span><span>Min</span><span>Max</span><span></span></div>
        ${[{key:"power",label:"Power",unit:"W",def:{min:0,max:3e3}},{key:"voltage",label:"Voltage",unit:"V",def:{min:0,max:250}},{key:"current",label:"Current",unit:"A",def:{min:0,max:16}},{key:"temperature",label:"Temperature",unit:"°C",def:{min:0,max:100}},{key:"humidity",label:"Humidity",unit:"%",def:{min:0,max:100}},{key:"carbon_dioxide",label:"CO₂",unit:"ppm",def:{min:400,max:2e3}},{key:"illuminance",label:"Illuminance",unit:"lx",def:{min:0,max:1e3}},{key:"battery",label:"Battery",unit:"%",def:{min:0,max:100}},{key:"energy",label:"Energy",unit:"kWh",def:{min:0,max:100}},{key:"signal_strength",label:"WiFi RSSI",unit:"dBm",def:{min:-100,max:-30}}].map(e=>{const i=h[e.key]??{},s=void 0!==i.min||void 0!==i.max;return q`
            <div class="range-row ${s?"set":""}">
              <span class="range-lbl">${e.label} <span class="range-unit">${e.unit}</span></span>
              <input type="number" class="range-inp" placeholder="${e.def.min}"
                .value=${void 0!==i.min?String(i.min):""}
                @change=${t=>u(e.key,"min",t.target.value)}/>
              <input type="number" class="range-inp" placeholder="${e.def.max}"
                .value=${void 0!==i.max?String(i.max):""}
                @change=${t=>u(e.key,"max",t.target.value)}/>
              ${s?q`<button class="color-reset" @click=${()=>{const i={...h};delete i[e.key],this._set("graph_style",{...t,sensor_ranges:Object.keys(i).length?i:void 0})}}>↺</button>`:q`<span></span>`}
            </div>`})}
      </div>`;return{graphtype:{icon:"∿",bg:"rgba(45,212,191,0.1)",fg:"#2dd4bf",label:"Graph Type",badge:Y,body:a},graphcolors:{icon:"◐",bg:"rgba(244,96,30,0.12)",fg:"#f4601e",label:"Per-sensor Colors",badge:Y,body:p},graphranges:{icon:"⇕",bg:"rgba(251,191,36,0.1)",fg:"#fbbf24",label:"Sensor Min / Max",badge:Object.keys(h).length?this._badge(`${Object.keys(h).length} set`,"#fbbf24","rgba(251,191,36,0.1)"):Y,body:g}}}_sensorSectionDescriptors(){const e=this._config,t=e.sensors??[],i={};return So.forEach(s=>{const o=s.items.map(e=>e.key),a=o.filter(e=>t.includes(e)).length,n=o.every(e=>t.includes(e)),r=this._badge(`${a||"All"} / ${s.items.length}`,s.iconColor,s.iconBg),l=q`
          <div class="sensors-hdr">
            <span class="sensors-hdr-lbl">${0===a?"All shown (default)":`${a} of ${s.items.length} shown`}</span>
            <button class="sensors-all-btn" @click=${e=>{e.stopPropagation();const i=n?t.filter(e=>!o.includes(e)):[...new Set([...t,...o])];this._set("sensors",i)}}>${n?"− Deselect all":"+ Select all"}</button>
          </div>
          <div class="sensor-grid">
            ${s.items.map(i=>{const s=t.includes(i.key),o=Ai(i.key),a=!!wi.find(e=>e.key===o),n=e.graph_sensors??Nt,r=n.some(e=>Ai(e)===o);return q`
                <div class="sensor-item ${s?"active":""}" @click=${()=>{const e=s?t.filter(e=>e!==i.key):[...t,i.key];this._set("sensors",e)}}>
                  <div class="sensor-dot" style="background:${s?i.defaultColor:"var(--t3)"}"></div>
                  <div class="sensor-item-body">
                    <span class="sensor-name">${i.label}</span>
                    ${i.unit?q`<span class="sensor-unit">${i.unit}</span>`:Y}
                  </div>
                  ${a?q`<button class="sensor-graph-btn ${r?"on":""}"
                    title="${r?"Remove from graphs":"Add to graphs"}"
                    @click=${e=>{e.stopPropagation();const t=r?n.filter(e=>Ai(e)!==o):[...n,o];this._set("graph_sensors",t)}}>∿</button>`:Y}
                </div>`})}
          </div>`,c=s.group.toLowerCase().replace(" ","");i[c]={icon:s.icon,bg:s.iconBg,fg:s.iconColor,label:s.group,badge:r,body:l}}),i}_renderTabSections(e,t,i){const s=uo.find(t=>t.id===e);if(!s)return q``;const o=new Set;return q`${s.sections.map(e=>{const s=t[e.id];if(!s)return Y;const a=i?i(e.id,o):Y;o.add(e.id);const n=q`${a}${this._sec(e.id,s.icon,s.bg,s.fg,e.label??s.label,s.badge,s.body)}`;return e.advanced?this._adv(n):n})}`}_renderGraphsSensorsTab(){const e=this._globalSectionDescriptors(),t=new Set(["electrical","environmental","deviceinfo","alerts"]);return this._renderTabSections("graphs",e,(e,i)=>{const s=[...i].some(e=>t.has(e));return t.has(e)&&!s?q`<div class="hint" style="margin:4px 2px 8px">Global default — override per room (Layout & Style → room) or per device (Rooms & devices).</div>`:Y})}_renderYamlTab(){const e=this._config,t=(e,i=0)=>{const s="  ".repeat(i);return Object.entries(e).map(([e,o])=>null==o?"":"object"!=typeof o||Array.isArray(o)?Array.isArray(o)?`${s}${e}:\n${o.map(e=>"object"==typeof e?`${s}  -\n${t(e,i+2)}`:`${s}  - ${e}`).join("\n")}`:`${s}${e}: ${o}`:`${s}${e}:\n${t(o,i+1)}`).filter(Boolean).join("\n")},i=t(e);return q`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;color:#50505c;font-family:monospace">Generated config</div>
        <button class="btn-copy" @click=${async()=>{await navigator.clipboard.writeText(i).catch(e=>{console.warn("[editor] clipboard write failed",e)})}}>Copy</button>
      </div>
      <pre class="yaml-out">${i}</pre>`}_configConflicts(){const e=this._config,t=[];if(!e)return t;const i=e.style??{},s=Ge.filter(e=>void 0!==i[e]);if(e.theme&&"custom"!==e.theme&&"ha"!==e.theme&&s.length){const i=Ve(this._effectivePalette());i!==e.theme&&t.push({title:`Theme is set to "${Ue[e.theme]??e.theme}" but the colours do not match it`,detail:`style: overrides the theme on every palette key it sets, so the card renders ${"custom"===i?"your custom colours":`"${Ue[i]??i}"`} instead. Re-pick a theme here to bring the two back in step.`})}for(const i of["header_cards","footer_cards"]){const s=e.views??[];if(e[i]?.length&&0!==s.length&&s.every(e=>void 0!==e[i])){const s="header_cards"===i?"Header":"Footer";t.push({title:`The card-wide ${s.toLowerCase()} cards never show`,detail:`Every view sets its own ${i}, and a view's list replaces the card-wide one rather than adding to it — so these ${e[i].length} card(s) are unreachable. Clear one view's override to let it fall back, or remove the card-wide list.`})}}const o=(e.views??[]).filter(e=>e.theme&&"custom"!==e.theme);if(o.length&&s.length&&t.push({title:(1===o.length?"A view replaces":`${o.length} views replace`)+" the card's colours",detail:`${o.map(e=>e.name||e.id).join(", ")} carry their own theme, which outranks the ${s.length} colour${s.length>1?"s":""} set in Design → Colours (${s.join(", ")}). Those apply only in views with no theme of their own.`}),e.smart_tile_styles&&e.tile_style&&t.push({title:"Smart tile styles never apply",detail:`A global tile style (${e.tile_style}) outranks the per-profile defaults that smart tile styles turns on. Clear the global style, or set styles per device type instead.`}),"universal"!==(e.mode??"shelly")){const i=["universal_scope","include_integrations","exclude_integrations","include_domains","exclude_domains"].filter(t=>null!=e[t]);i.length&&t.push({title:"Discovery filters are set but do nothing in Shelly mode",detail:`${i.join(", ")} only apply when mode is universal. Shelly mode already keeps just Shelly and BTHome devices.`})}if("universal"===(e.mode??"shelly")&&this.hass&&(e.exclude_integrations?.length||e.exclude_domains?.length)){const i=oi(this.hass),s=(e,t)=>e.length>0&&e.every(e=>(t??[]).includes(e));s(i.integrations,e.exclude_integrations)&&!(e.include_integrations??[]).length&&t.push({title:"Every discovered integration is hidden",detail:"Nothing is left to discover, so the card renders empty. Clear some in Discovery, or force one back with include_integrations."}),s(i.domains,e.exclude_domains)&&t.push({title:"Every entity type is hidden",detail:"No entity domain is left, so no device has anything to show. Clear some in Discovery."})}const a=(e,t)=>(e??[]).filter(e=>(t??[]).includes(e)),n=a(e.include_domains,e.exclude_domains);n.length&&t.push({title:`Domain both included and excluded: ${n.join(", ")}`,detail:"Excluded wins for domains — those entities are dropped."});const r=a(e.include_integrations,e.exclude_integrations);if(r.length&&t.push({title:`Integration both included and excluded: ${r.join(", ")}`,detail:"Included wins for integrations — the opposite of how domains resolve, so this is worth a second look."}),!e.delegate_controls){const i=[e.tile_layout,...Object.values(e.device_styles??{}).map(e=>e.tile_layout),...Object.values(e.profile_styles??{}).map(e=>e.tile_layout),...Object.values(e.custom_styles??{}).map(e=>e.tile_layout)];i.some(e=>(function(e){const t=Rt(e);return t&&t.flat()}(e)??[]).includes("delegated_controls"))&&t.push({title:"The Native controls block is in a layout but the feature is off",detail:"delegate_controls is off, so that block renders nothing. Turn it on under Rooms & devices, or drop the block."})}const l=new Set(Object.keys(e.custom_styles??{})),c=[e.tile_style,...Object.values(e.device_styles??{}).map(e=>e.tile_style),...Object.values(e.profile_styles??{}).map(e=>e.tile_style),...Object.values(e.area_styles??{}).map(e=>e.tile_style)],d=[...new Set(c.filter(e=>"string"==typeof e&&e.startsWith("custom:")&&!l.has(e.slice(7))))];d.length&&t.push({title:`Saved style not found: ${d.join(", ")}`,detail:"Whatever points at it falls back to the default tile style."});const p=this._allDevices(),h=new Set(p.map(e=>e.device_id)),u=Object.keys(e.device_styles??{}).filter(e=>!h.has(e));u.length&&t.push({title:`${u.length} device styling block${u.length>1?"s":""} for a device that is not here`,detail:"The device was removed, re-added with a new id, or is filtered out by discovery. Harmless, but it will never apply."});const g=new Set(p.map(e=>e.area??"").filter(Boolean)),v=Object.keys(e.area_styles??{}).filter(e=>"Favourites"!==e&&!g.has(e));v.length&&t.push({title:`Room styling for rooms with no devices: ${v.join(", ")}`,detail:"Usually a renamed area — room styles are keyed by name, so a rename orphans them."});const f=Object.keys(e).filter(e=>!Di.includes(e)&&!Oi.includes(e)&&!e.startsWith("_"));f.length&&t.push({title:`The card does not read: ${f.join(", ")}`,detail:"Unknown keys are ignored in silence — usually a typo, an option from another card, or one this card has dropped."});const m=[];for(const[t,i]of Object.entries(e.device_styles??{})){const e=Object.keys(i.input_actions??{});if(!e.length||!this.hass)continue;const s=p.find(e=>e.device_id===t);if(!s)continue;const o=Ni(s,this.hass.states);for(const t of e){(/^\d+$/.test(t)?o.some(e=>String(e.channel)===t):o.some(e=>e.entityId===t))||m.push(`${s.name} → ${t}`)}}m.length&&t.push({title:`Input action for a channel that is not there: ${m.join("; ")}`,detail:"That channel entity was renamed or removed, so the key never renders. Re-add the action against the current channel."});const b=[];for(const[t,i]of Object.entries(e.device_styles??{}))for(const[e,s]of Object.entries(i.input_actions??{}))"dim"===s.double_tap_action?.action&&b.push(`${this._allDevices().find(e=>e.device_id===t)?.name??t} → ${e}`);b.length&&t.push({title:`Double tap set to "dim": ${b.join("; ")}`,detail:"Dimming is a press-and-hold ramp, so a double tap has nothing to run — it delays the single tap and then does nothing. Move it to On hold."});const y=new Set;for(const t of Object.values(e.device_styles??{}))for(const e of Object.values(t.input_actions??{})){const t=[e.entity,e.hold_action?.entity,e.double_tap_action?.entity,e.select_chip?.entity].flatMap(e=>Array.isArray(e)?e:e?[e]:[]);for(const e of t)this.hass&&!this.hass.states[e]&&y.add(e)}y.size&&t.push({title:`Input action target does not exist: ${[...y].join(", ")}`,detail:"The key still renders, but pressing it does nothing."});const x=[];for(const[t,i]of Object.entries(e.device_styles??{}))for(const e of i.extra_sensors??[])if(this.hass&&!this.hass.states[e]){const i=this._allDevices().find(e=>e.device_id===t)?.name??t;x.push(`${e} (on ${i})`)}return x.length&&t.push({title:`Extra sensor does not exist: ${x.join(", ")}`,detail:"It is skipped, so the tile shows nothing for it — remove it or pick the renamed entity."}),t}_renderConflicts(){const e=this._configConflicts();return e.length?q`
      <div class="conflict-panel">
        <div class="conflict-hdr" @click=${()=>{this._conflictsOpen=!this._conflictsOpen}}>
          <span class="conflict-badge">${e.length}</span>
          <span class="conflict-title">${1===e.length?"setting is overridden or ignored":"settings are overridden or ignored"}</span>
          <span class="conflict-caret">${this._conflictsOpen?"▾":"▸"}</span>
        </div>
        ${this._conflictsOpen?q`
          <div class="conflict-list">
            ${e.map(e=>q`
              <div class="conflict-item">
                <div class="conflict-item-title">${e.title}</div>
                <div class="conflict-item-detail">${e.detail}</div>
              </div>`)}
          </div>`:Y}
      </div>`:Y}_applyTheme(e){const t={...this._config.style??{}};for(const e of Ge)delete t[e];this._set("style",Object.keys(t).length?t:void 0),this._set("theme",e)}_onPickTheme(e){const t=this._config.style??{};Ge.some(e=>void 0!==t[e])&&this._stashColours("Before theme change"),this._applyTheme(e),this._rolled=`${Ue[e]??e} — previous colours are under ★ Before theme change`,this._clearRolledSoon()}_applyPalette(e){const t=this._palettes[e];t&&(this._set("style",{...this._config.style??{},...t}),this._set("theme","custom"))}_resetLook(){const e=this._config,t={};for(const i of wo._CONTENT_KEYS)void 0!==e[i]&&(t[i]=e[i]);this._emitNow({type:"custom:ha-device-dashboard",...Mi(),...t})}_onResetEverything(){this._resetArmed?(this._resetArmed=!1,this._emitNow({type:"custom:ha-device-dashboard",...Mi()})):this._resetArmed=!0}_themeActions(){return q`
      <button class="sec-toolbar-btn" title="Land on a random preset"
        @click=${()=>this._rollTheme()}>🎲 Random</button>
      <button class="sec-toolbar-btn" title="Generate a palette from a random hue, contrast-checked"
        @click=${()=>this._rollPalette()}>✨ Surprise me</button>
      <button class="sec-toolbar-btn" title="Save the colours you are looking at"
        @click=${()=>{this._paletteNaming=!this._paletteNaming}}>💾 Save</button>`}_renderThemeGrid(){const e=this._effectivePalette(),t="ha"===this._config.theme?"ha":Ve(e);return q`
      ${this._paletteNaming?q`
        <div class="snap-row" style="margin-bottom:6px">
          <input type="text" class="inline-text" style="flex:1" placeholder="Name these colours…"
            .value=${this._paletteName}
            @input=${e=>{this._paletteName=e.target.value}}
            @keydown=${e=>{"Enter"===e.key&&this._savePalette(this._paletteName)}}/>
          <button class="sec-toolbar-btn" @click=${()=>this._savePalette(this._paletteName)}>Save</button>
        </div>`:Y}
      ${this._rolled?q`<div class="cr-rolled">${this._rolled} — previous colours are under ★ Saved</div>`:Y}
      <div class="theme-grid">
        ${Object.entries(this._palettes).map(([t,i])=>q`
          <div class="saved-wrap">
            <button class="theme-swatch saved ${(t=>Object.entries(t).every(([t,i])=>e[t]===i))(i)?"on":""}"
              title="Restore “${t}”" @click=${()=>this._applyPalette(t)}>
              <span class="ts-preview" style="background:${i.card_bg??"#1e1a17"}">
                <span class="ts-tile" style="background:${i.tile_bg??"rgba(255,255,255,.04)"};border:1px solid ${i.tile_border??"rgba(255,255,255,.08)"}"></span>
                <span class="ts-accent" style="background:${i.accent_color??"#c98a63"}"></span>
              </span>
              <span class="ts-name">★ ${t}</span>
            </button>
            <button class="saved-x" title="Forget “${t}”"
              @click=${e=>{e.stopPropagation(),this._deletePalette(t)}}>✕</button>
          </div>`)}
        <button class="theme-swatch ${"ha"===t?"on":""}"
          title="Take every colour from the Home Assistant theme that is active"
          @click=${()=>this._onPickTheme("ha")}>
          <span class="ts-preview" style="background:var(--primary-background-color,#fafafa)">
            <span class="ts-tile" style="background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,rgba(0,0,0,.12))"></span>
            <span class="ts-accent" style="background:var(--primary-color,#03a9f4)"></span>
          </span>
          <span class="ts-name">${Ue.ha}</span>
        </button>
        ${He.map(e=>{const i=je[e];return q`
            <button class="theme-swatch ${t===e?"on":""}" title=${Ue[e]}
              @click=${()=>this._onPickTheme(e)}>
              <span class="ts-preview" style="background:${i.card_bg}">
                <span class="ts-tile" style="background:${i.tile_bg};border:1px solid ${i.tile_border}"></span>
                <span class="ts-accent" style="background:${i.accent_color}"></span>
              </span>
              <span class="ts-name">${Ue[e]}</span>
            </button>`})}
      </div>
      ${"custom"===t?q`<div class="hint">Custom — your colours don't match a preset. 💾 Save keeps them; picking a preset stashes them under ★ first.</div>`:Y}`}_renderDefaultsPanel(){const e=this._config,t=e.views??[];return q`
      <div class="defaults-panel">
        <div class="dp-grid">
          <div class="dp-group">
            <div class="dp-title">Default view</div>
            ${t.length?q`
              <div class="pill-grp">
                ${t.map((i,s)=>q`
                  <span class="pill ${(e.default_view??t[0].id)===i.id?"on":""}"
                    @click=${()=>this._set("default_view",0===s?void 0:i.id)}>${i.name||i.id}</span>`)}
              </div>`:q`<div class="hint">No views yet — add them in the Views tab.</div>`}
          </div>

          <div class="dp-group">
            <div class="dp-title" style="display:flex;align-items:center;gap:6px">
              <span>Colour theme</span>
              <span class="sec-toolbar-spacer"></span>
              ${this._themeActions()}
            </div>
            ${this._renderThemeGrid()}
          </div>

          <div class="dp-group">
            <div class="dp-title">Default tile style
              ${e.tile_style?q`<button class="color-reset" @click=${()=>{this._set("tile_style",void 0),this._set("power_monitor_variant",void 0)}}>↺ reset</button>`:q`<span class="dp-hint-inline">adaptive</span>`}
            </div>
            ${this._renderTileStylePicker(e.tile_style,e.power_monitor_variant??"big-number",void 0,e=>this._set("tile_style",e),e=>this._set("power_monitor_variant",e),e.show_graphs,e=>this._set("show_graphs",e))}
          </div>

          <div class="dp-group">
            <div class="dp-title">Tile behaviour</div>
            <div class="dp-hint-inline">Smart tile styles and Native controls live in Design → Tiles, next to the rest of the tile settings.</div>
            <button class="sec-toolbar-btn" style="align-self:flex-start"
              @click=${()=>{this._gotoControl("design","design-tiles","delegate_controls"),this._defaultsOpen=!1}}>Open Tiles →</button>
          </div>

          <div class="dp-group">
            <div class="dp-title">Default tile layout</div>
            <div class="field">
              <div class="field-lbl">Columns — <span style="color:#f4601e">${e.columns??3}</span></div>
              <input type="range" min="1" max="6" step="1" .value=${String(e.columns??3)}
                @input=${e=>this._set("columns",parseInt(e.target.value,10))}/>
            </div>
            <div class="field">
              <div class="field-lbl">Tile size</div>
              <div class="pill-grp">
                ${["sm","md","lg"].map((t,i)=>q`
                  <span class="pill ${(e.tile_size??"md")===t?"on":""}" @click=${()=>this._set("tile_size",t)}>${["Small","Medium","Large"][i]}</span>`)}
              </div>
            </div>
            <button class="sec-toolbar-btn" style="align-self:flex-start"
              @click=${()=>{this._tab="design",this._defaultsOpen=!1}}>More tile settings →</button>
          </div>

          <div class="dp-group">
            <div class="dp-title">Reset</div>
            <div class="dp-hint-inline">Restore the built-in default look. “Reset look” keeps your rooms, devices, views, favourites and discovery settings; “Reset everything” clears the whole card back to factory.</div>
            <div class="pill-grp" style="gap:8px">
              <button class="sec-toolbar-btn" @click=${()=>{this._resetArmed=!1,this._resetLook()}}>Reset look</button>
              <button class="sec-toolbar-btn" style=${this._resetArmed?"color:#f4601e;border-color:#f4601e":""}
                @click=${()=>this._onResetEverything()}>
                ${this._resetArmed?"Click again to wipe everything":"Reset everything"}</button>
            </div>
          </div>
        </div>
      </div>`}render(){if(!this._config)return q``;const e=uo.map(e=>({id:e.id,label:e.label,icon:e.icon})),t=new Set(uo.flatMap(e=>e.sections.filter(e=>e.advanced).map(e=>e.id))),i={};uo.forEach(e=>{i[e.id]=e.sections.map(e=>e.id)}),i.devices=["rooms","lights"],i.views=[],i.yaml=[];const s=Object.fromEntries(Object.entries(i).map(([e,i])=>[e,this._advanced?i:i.filter(e=>!t.has(e))])),o=s[this._tab]??[],a=()=>[wo.FAV_ROW_KEY,...new Set(this._allDevices().map(e=>e.area??""))],n="views"===this._tab?{keys:(this._config.views??[]).map(e=>e.id),isOpen:e=>this._expandedViewIds.has(e),setAll:e=>{this._expandedViewIds=e?new Set((this._config.views??[]).map(e=>e.id)):new Set}}:"devices"===this._tab?{keys:a(),isOpen:e=>this._expandedRooms.has(e),setAll:e=>{this._expandedRooms=e?new Set(a()):new Set}}:{keys:o,isOpen:e=>!!this._openSections[e],setAll:e=>{if(!o.length)return;const t={...this._openSections};for(const i of o)t[i]=e;this._openSections=t}},r=n.keys.length>0&&n.keys.every(n.isOpen),l=n.keys.length>1,c=e.findIndex(e=>e.id===this._tab);return q`
      <div class="shell">
        <div class="tab-nav-wrap">
          <button class="tab-arrow" title="Previous tab" ?disabled=${c<=0}
            @click=${()=>this._stepTab(-1)}>‹</button>
          <div class="tab-nav">
            ${e.map(e=>q`
              <div class="tab ${this._tab===e.id?"active":""}" data-tab=${e.id} @click=${()=>{this._tab=e.id}}>
                <span class="tab-icon">${e.icon}</span>${e.label}
              </div>`)}
          </div>
          <button class="tab-arrow" title="Next tab" ?disabled=${c>=e.length-1}
            @click=${()=>this._stepTab(1)}>›</button>
        </div>
        <div class="sec-toolbar">
          <label class="adv-toggle" title="Show advanced, power-user controls">
            <span class="sw">
              <input type="checkbox" .checked=${this._advanced}
                @change=${e=>this._setAdvanced(e.target.checked)}>
              <span class="sw-t"></span><span class="sw-b"></span>
            </span>
            <span class="adv-lbl">Advanced</span>
          </label>
          <button class="sec-toolbar-btn defaults-btn ${this._defaultsOpen?"active":""}"
            title="Set the card's default look — view, theme, tile style & layout"
            @click=${()=>{this._defaultsOpen=!this._defaultsOpen}}>◆ Defaults</button>
          <button class="sec-toolbar-btn ${this._helpOpen?"active":""}"
            title="How the card fits together"
            @click=${()=>{this._helpOpen=!this._helpOpen}}>? Help</button>
          ${(()=>{const e=this._designOverrides().length;return q`
              <button class="sec-toolbar-btn changes-btn ${this._changesOpen?"active":""} ${e?"lit":""}"
                title=${e?"Everything this card changes from the default look":"Nothing is customised - the card is on its theme"}
                @click=${()=>{this._changesOpen=!this._changesOpen,this._changesResetArmed=!1}}>
                ◆ ${e?`${e} change${e>1?"s":""}`:"No changes"}</button>`})()}
          ${l?q`
            <button class="sec-toolbar-btn"
              title=${r?"Collapse everything on this tab":"Expand everything on this tab"}
              @click=${()=>n.setAll(!r)}>
              ${r?"▸ Collapse all":"▾ Expand all"}</button>
          `:Y}

          <span class="sec-toolbar-spacer"></span>
          ${this._renderSnapshotControls()}
        </div>
        ${this._snapMsg?q`<div class="snap-msg">${this._snapMsg}</div>`:Y}
        ${this._defaultsOpen?this._renderDefaultsPanel():Y}
        ${this._changesOpen?this._renderChangesPanel():Y}
        ${this._helpOpen?this._renderHelpPanel():Y}
        ${this._renderConflicts()}
        <div class="tab-body">
          ${(()=>(({devices:()=>this._renderDevicesTab(),views:()=>this._renderViewsTab(),design:()=>this._renderDesignTab(),graphs:()=>this._renderGraphsSensorsTab(),yaml:()=>this._renderYamlTab()}[this._tab]??(()=>this._renderCustomTab(this._tab)))()))()}
        </div>
        ${this._renderIconGridPopover()}
        ${this._renderColorWheel()}
      </div>`}};To.FAV_ROW_KEY="★ Favourites",To.LS_SNAPSHOTS="shelly-dashboard:cardSnapshots",To.LS_PALETTES="shelly-dashboard:palettes",To.LS_ADVANCED="shelly-dashboard:editorAdvanced",To.ROLL_SLOT="Before roll",To._realCardTypes=null,To._cardTypeProbe=null,To.ROW_MAX=3,To.DRAG_SLOP=6,To._CONTENT_KEYS=["type","title","mode","universal_scope","include_integrations","exclude_integrations","include_domains","exclude_domains","areas","devices","hidden_devices","favorites","hidden_entities","show_offline","views","default_view","delegate_controls","sensors","graph_sensors","energy_period","header_chips","area_header_chips"],To.styles=[mt,Ye,r`
    :host {
      display:block;
      font-family:'DM Sans',sans-serif;
    }
    * { box-sizing:border-box; }

    /* ── CSS vars ── */
    .shell {
      --bg:#0f0f12; --s1:#17171c; --s2:#1e1e26; --s3:#25252f;
      --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
      --text:#e2e2e8; --t2:#888896; --t3:#555560;
      --accent:#f4601e; --accentbg:rgba(244,96,30,0.12); --accentbdr:rgba(244,96,30,0.3);
      --blue:#4a9eff; --green:#4ade80; --purple:#a78bfa; --teal:#2dd4bf; --amber:#fbbf24;
      background:var(--bg); color:var(--text); border-radius:8px;
      overflow-x:hidden; overflow-y:visible;
      display:flex; flex-direction:column;
      min-height:400px;
    }
    /* Arrows flank the strip: it scrolls, but its scrollbar is hidden and a mouse
       has nothing to drag, so off-screen tabs were unreachable on a tablet. */
    .tab-nav-wrap { display:flex; align-items:stretch; background:var(--s1);
      border-bottom:1px solid var(--border); flex-shrink:0; }
    .tab-arrow { flex:0 0 auto; padding:10px 8px 0; background:none; border:none; cursor:pointer;
      color:var(--t2); font-size:18px; line-height:1; font-family:inherit; }
    .tab-arrow:hover:not(:disabled) { color:var(--accent); }
    .tab-arrow:disabled { opacity:.25; cursor:default; }
    .tab-nav { display:flex; gap:2px; padding:10px 4px 0; background:var(--s1); overflow-x:auto; flex:1; min-width:0; scroll-behavior:smooth; }
    .tab-nav::-webkit-scrollbar { height:0; }
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; display:flex; align-items:center; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .tab-icon { margin-right:5px; font-size:10px; opacity:0.7; }
    .sec-toolbar { display:flex; align-items:center; gap:6px; padding:8px 16px 0; background:var(--s1); flex-shrink:0; }
    /* Brief pulse on a control someone was sent to, so the jump lands visibly. */
    @keyframes ctl-flash { 0%,100% { background:transparent; } 30% { background:var(--accentbg); } }
    .ctl-flash { animation:ctl-flash 1.1s ease-in-out 2; border-radius:8px; }
    .sec-toolbar-spacer { flex:1; }
    .snap-wrap { position:relative; display:flex; gap:6px; }
    .snap-menu { position:absolute; top:calc(100% + 6px); right:0; z-index:30; min-width:250px;
      display:flex; flex-direction:column; gap:4px; padding:8px;
      background:var(--s2,var(--s1)); border:1px solid var(--border); border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.35); }
    .snap-row { display:flex; align-items:center; gap:4px; }
    .snap-item { display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:6px 8px; border-radius:7px; border:1px solid transparent; background:none;
      color:var(--text); font:inherit; font-size:12px; cursor:pointer; text-align:left; }
    .snap-item:hover { background:var(--s1); border-color:var(--border); }
    .snap-name { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .snap-date { font-size:10.5px; color:var(--t3); white-space:nowrap; }
    .snap-x { background:none; border:none; color:var(--t3); cursor:pointer; font-size:12px; padding:4px; }
    .snap-x:hover { color:var(--accent); }
    .snap-empty { font-size:11.5px; color:var(--t3); padding:4px 8px; }
    .snap-msg { margin:6px 16px 0; font-size:11.5px; color:var(--accent); }

    /* ? Help — concepts then recipes, one topic open at a time. */
    .help-panel { margin:8px 16px 0; padding:10px; border:1px solid var(--border); border-radius:10px;
      background:var(--s2,var(--s1)); max-height:52vh; overflow-y:auto; }
    .help-hdr { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .help-title { font-size:12.5px; font-weight:700; color:var(--accent); }
    .help-search { flex:1; }
    .help-intro { font-size:11.5px; color:var(--t2); line-height:1.5; margin-bottom:8px; }
    .help-group { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
      color:var(--t3); margin:10px 0 4px; }
    .help-topic { border-top:1px solid var(--border); }
    .help-topic-hdr { display:flex; align-items:center; gap:6px; width:100%; padding:7px 2px;
      background:none; border:none; color:var(--text); font:inherit; font-size:12px; font-weight:600;
      text-align:left; cursor:pointer; }
    .help-topic-hdr:hover { color:var(--accent); }
    .help-caret { color:var(--t3); font-size:10px; }
    .help-topic-body { padding:0 2px 8px 16px; font-size:11.5px; color:var(--t2); line-height:1.6; }
    .help-topic-body p { margin:0 0 7px; }
    .help-topic-body ol { margin:6px 0 0; padding-left:18px; }
    .help-topic-body li { margin-bottom:5px; }
    .help-topic-body b { color:var(--text); }
    .cr-rolled { margin:2px 0 6px; font-size:11.5px; color:var(--accent); }
    .saved-wrap { position:relative; display:inline-flex; }
    .saved-x { position:absolute; top:-4px; right:-4px; width:16px; height:16px; border-radius:50%;
      display:grid; place-items:center; cursor:pointer; font-size:9px; line-height:1;
      color:var(--t2); background:var(--s1); border:1px solid var(--border); }
    .saved-wrap:hover .saved-x { color:var(--accent); border-color:var(--accent); }
    .help-code { font-family:ui-monospace,Menlo,Consolas,monospace; font-size:10.5px;
      background:var(--s1); border:1px solid var(--border); border-radius:4px; padding:1px 4px; }
    .adv-toggle { display:inline-flex; align-items:center; gap:7px; cursor:pointer; user-select:none; }
    .adv-lbl { font-size:11px; font-weight:600; letter-spacing:.02em; color:var(--t2); }
    .adv-toggle:hover .adv-lbl { color:var(--text); }
    .defaults-btn.active { background:var(--accentbg); color:var(--accent); border-color:var(--accentbdr); }
    /* Defaults quick-setup panel */
    .defaults-panel { padding:12px 16px; background:var(--s1); border-bottom:1px solid var(--border); flex-shrink:0; max-height:52vh; overflow-y:auto; }
    .dp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; }
    .dp-group { display:flex; flex-direction:column; gap:8px; background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px; }
    .dp-title { font-size:11px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--t2); display:flex; align-items:center; gap:8px; }
    .dp-hint-inline { font-size:12px; line-height:1.4; font-weight:400; text-transform:none; letter-spacing:0; color:var(--t2); }
    .check-dd-btn { display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;
      font-size:12px; color:var(--text); background:var(--s2); border:1px solid var(--border); border-radius:6px;
      padding:7px 10px; cursor:pointer; text-align:left; }
    .check-dd-btn:hover { border-color:var(--border2); }
    .check-dd-caret { transition:transform .15s; color:var(--t3); }
    .check-dd-btn.open .check-dd-caret { transform:rotate(180deg); }
    .check-dd-panel { margin-top:4px; max-height:220px; overflow-y:auto; border:1px solid var(--border);
      border-radius:6px; background:var(--s2); padding:4px; display:flex; flex-direction:column; gap:1px; }
    .check-dd-row { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text);
      padding:5px 7px; border-radius:4px; cursor:pointer; }
    .check-dd-row:hover { background:var(--s3); }
    .check-dd-empty { font-size:11px; color:var(--t3); padding:6px 7px; }
    /* Sticky so Hide all / Clear stay reachable in a long list. */
    .check-dd-head { position:sticky; top:0; z-index:1; display:flex; align-items:center;
      justify-content:space-between; gap:8px; padding:5px 7px; background:var(--s2,var(--s1));
      border-bottom:1px solid var(--border); }
    .check-dd-count { font-size:10.5px; font-weight:600; color:var(--t3); }
    /* ── ◆ n changes ── lit only when something differs from the theme, so a
       card on its defaults says so plainly instead of showing a zero. */
    .changes-btn.lit { color:var(--accent); border-color:var(--accent); }
    .changes-panel { border:1px solid var(--border2); border-radius:10px; padding:10px 12px; margin:6px 0 2px;
      display:flex; flex-direction:column; gap:8px; }
    .changes-hdr { display:flex; align-items:center; gap:8px; font-size:.8em; font-weight:700; }
    .changes-group { display:flex; flex-direction:column; gap:2px; }
    .changes-scope { display:flex; align-items:center; gap:6px; font-size:.72em; text-transform:uppercase;
      letter-spacing:.05em; color:var(--t3); margin-top:4px; }
    .changes-row { display:flex; align-items:center; gap:8px; padding:2px 0 2px 12px; font-size:.8em; }
    .changes-key { font-weight:600; min-width:150px; display:flex; align-items:center; gap:5px; }
    .changes-pal { font-size:.75em; font-weight:400; padding:0 5px; border-radius:8px;
      background:var(--accentbg); color:var(--accent); }
    .changes-val { flex:1; color:var(--t3); font-family:ui-monospace,Menlo,Consolas,monospace; font-size:.9em;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* ── Design tab (scope-first) ── */
    .dsn-picker { display:flex; flex-direction:column; gap:6px; }
    .dsn-pick-lbl { font-size:.82em; text-transform:uppercase; letter-spacing:.05em; color:var(--t3); margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .dsn-pick-row { display:flex; flex-wrap:wrap; gap:4px; }
    .dsn-chip { display:inline-flex; align-items:center; gap:5px; font-family:inherit; font-size:.86em; font-weight:600;
      padding:3px 9px; border-radius:20px; cursor:pointer; color:var(--text);
      background:var(--bg2); border:1px solid var(--border2); transition:all .15s; }
    .dsn-chip:hover { border-color:var(--accent); }
    .dsn-chip.on { border-color:var(--accent); background:var(--accentbg); color:var(--accent); }
    .dsn-chip.grp { font-weight:700; }
    .dsn-chip.browse { cursor:default; opacity:.7; }
    .dsn-chip.browse:hover { border-color:var(--border2); }
    .dsn-chip.dev { font-weight:400; }
    .dsn-chip-apply { font-family:inherit; font-size:1em; font-weight:inherit; padding:0;
      background:transparent; border:none; color:inherit; cursor:pointer; }
    /* How many keys this rung overrides — makes the tree show where
       customisation actually lives, without opening every scope to find out. */
    .dsn-count { font-size:.85em; font-weight:700; padding:0 5px; border-radius:8px;
      background:var(--accent); color:#fff; }
    .dsn-groupby { font-family:inherit; font-size:.9em; text-transform:none; letter-spacing:0;
      padding:1px 7px; border-radius:10px; cursor:pointer; color:var(--t3);
      background:transparent; border:1px solid var(--border2); }
    .dsn-groupby.on { color:var(--accent); border-color:var(--accent); }
    .dsn-tree { display:flex; flex-direction:column; gap:2px; max-height:280px; overflow-y:auto; }
    .dsn-group-hdr { display:flex; align-items:center; gap:6px; }
    .dsn-twisty { font-family:inherit; font-size:.8em; width:18px; padding:0; cursor:pointer;
      background:transparent; border:none; color:var(--t3); }
    .dsn-group-n { font-size:.8em; color:var(--t3); }
    .dsn-group-body { display:flex; flex-wrap:wrap; gap:4px; padding:4px 0 6px 24px; }
    .dsn-panel { display:flex; flex-direction:column; gap:10px; }
    .dsn-scope-hdr { display:flex; align-items:center; gap:8px; padding-bottom:6px; border-bottom:1px solid var(--border2); }
    .dsn-scope-name { font-weight:800; font-size:1.05em; }
    .dsn-badge { font-size:.78em; padding:2px 7px; border-radius:10px; background:var(--bg2); color:var(--t3); }
    .dsn-badge.on { background:var(--accentbg); color:var(--accent); font-weight:700; }
    .dsn-family { border:1px solid var(--border2); border-radius:8px; padding:8px 10px; }
    .dsn-family.off { opacity:.65; }
    .dsn-family-hdr { font-size:.72em; text-transform:uppercase; letter-spacing:.05em; color:var(--t3); margin-bottom:6px; }
    .dsn-row { padding:6px 0; border-top:1px solid var(--border2); }
    .dsn-row:first-of-type { border-top:none; }
    .dsn-row-hdr { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
    .dsn-row-lbl { font-size:.85em; font-weight:600; flex:1; }
    .dsn-reset { font-family:inherit; font-size:.8em; padding:0 5px; cursor:pointer;
      background:transparent; border:1px solid var(--border2); border-radius:6px; color:var(--t3); }
    .dsn-reset:hover { color:var(--accent); border-color:var(--accent); }

    .theme-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
    .theme-swatch { display:flex; flex-direction:column; align-items:center; gap:4px; padding:5px 3px; border:1px solid var(--border2); border-radius:6px; background:transparent; cursor:pointer; transition:all .15s; }
    .theme-swatch:hover { border-color:var(--accent); }
    .theme-swatch.on { border-color:var(--accent); background:var(--accentbg); }
    .ts-preview { position:relative; width:100%; height:30px; border-radius:4px; overflow:hidden; display:block; border:1px solid rgba(0,0,0,.3); }
    .ts-tile { position:absolute; left:5px; top:6px; width:22px; height:18px; border-radius:3px; }
    .ts-accent { position:absolute; right:5px; top:9px; width:12px; height:12px; border-radius:50%; }
    .ts-name { font-size:9px; font-weight:600; color:var(--t2); text-align:center; line-height:1.1; }
    .theme-swatch.on .ts-name { color:var(--text); }
    .theme-swatch.saved .ts-name { color:var(--accent); }
    .sec-toolbar-btn { font-size:10px; padding:4px 9px; border-radius:4px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; transition:all .15s; }
    .sec-toolbar-btn:hover { background:var(--s3); color:var(--text); border-color:var(--accent); }

    /* Extra-cards manager */
    .xc-list { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    .xc-row { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; background:var(--s2); border:1px solid var(--border); }
    .xc-type { flex:1; font-size:12px; font-family:monospace; color:var(--t2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .xc-btn { font-size:10px; padding:2px 8px; border-radius:4px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; }
    .xc-btn:hover { background:var(--s3); color:var(--text); }
    .xc-del { color:#e5837a; }
    .xc-del:hover { border-color:#e5837a; color:#fff; background:#e5837a; }
    .xc-actions { display:flex; gap:6px; margin-top:6px; }
    .xc-import-list { display:flex; flex-direction:column; gap:3px; margin-top:6px; max-height:220px; overflow-y:auto; }
    .xc-import-row { flex:0 0 auto; min-height:26px; text-align:left; font-size:11px; font-family:monospace; padding:5px 8px; border-radius:5px; border:1px solid var(--border); background:var(--s2); color:var(--t2); cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .xc-import-row:hover { background:var(--s3); color:var(--text); border-color:var(--accent); }
    .xc-yaml { width:100%; min-height:120px; font-family:monospace; font-size:12px; background:var(--s2); color:var(--t2); border:1px solid var(--border); border-radius:6px; padding:8px; resize:vertical; }
    .xc-mode-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
    /* The card's own editor. It is Home Assistant's markup, so it is left to
       HA's theme variables (which inherit from :root) rather than restyled to
       match this panel — a form that looks like HA's is the point. */
    .xc-form { margin-top:2px; }
    .xc-form > * { display:block; }
    /* Live preview of the card being edited. The checker plate is deliberate:
       many cards are translucent, and on a flat panel you cannot tell a
       transparent background from one that matches the panel by accident. */
    .xc-preview {
      margin-top:6px; padding:10px; border-radius:8px;
      border:1px dashed var(--border2);
      background:
        linear-gradient(45deg, rgba(255,255,255,.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.03) 75%),
        linear-gradient(45deg, rgba(255,255,255,.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.03) 75%),
        var(--s1);
      background-size:16px 16px; background-position:0 0, 8px 8px;
    }
    .xc-preview > hdd-card { display:block; }
    ha-yaml-editor { display:block; margin-top:4px; }
    .tab-body { padding:16px; background:var(--bg); overflow-y:auto; flex:1; min-height:0; }

    /* Conflict panel — settings that another setting overrides or ignores. */
    .conflict-panel { margin:0 16px; border:1px solid rgba(219,162,92,.35);
      border-radius:10px; background:rgba(219,162,92,.08); overflow:hidden; }
    .conflict-hdr { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer;
      user-select:none; }
    .conflict-hdr:hover { background:rgba(219,162,92,.10); }
    .conflict-badge { min-width:20px; height:20px; padding:0 6px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background:#dba25c; color:#1e1a17; font-size:11px; font-weight:800; }
    .conflict-title { flex:1; font-size:12.5px; font-weight:600; color:#dba25c; }
    .conflict-caret { color:#dba25c; font-size:12px; }
    .conflict-list { padding:2px 10px 10px; display:flex; flex-direction:column; gap:8px; }
    .conflict-item { border-left:2px solid rgba(219,162,92,.5); padding-left:8px; }
    .conflict-item-title { font-size:12px; font-weight:650; color:var(--text); }
    .conflict-item-detail { font-size:11.5px; color:var(--t2); margin-top:2px; line-height:1.45; }
    .tab-body::-webkit-scrollbar { width:5px; }
    .tab-body::-webkit-scrollbar-track { background:var(--s2); }
    .tab-body::-webkit-scrollbar-thumb { background:var(--s3); border-radius:3px; }
    .tab-body::-webkit-scrollbar-thumb:hover { background:var(--t3); }

    /* ── Section accordion ── */
    .sec { border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:6px; }
    .sec-hdr { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer; user-select:none; background:var(--s2); transition:background .12s; }
    .sec-hdr:hover { background:var(--s3); }
    .sec-hdr-l { display:flex; align-items:center; gap:9px; }
    .sec-ico { width:22px; height:22px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
    .sec-title { font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--text); }
    .sec-hdr-r { display:flex; align-items:center; gap:8px; }
    .sec-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; }
    .chev { font-size:10px; color:var(--t3); transition:transform .2s; }
    .sec.open .chev { transform:rotate(180deg); }
    .sec-body { display:none; padding:16px; border-top:1px solid var(--border); background:var(--bg); }
    .sec.open .sec-body { display:block; }

    /* ── Field labels ── */
    .field { margin-bottom:12px; }
    .field:last-child { margin-bottom:0; }
    .field-lbl { font-size:12px; font-weight:600; letter-spacing:0.04em; color:var(--t2); text-transform:uppercase; margin-bottom:7px; }
    .field-note { font-size:9px; font-weight:400; color:var(--t3); text-transform:none; letter-spacing:0; float:right; }

    /* ── Range inputs ── */
    input[type="range"] { width:100%; accent-color:var(--accent); cursor:pointer; }
    input[type="text"] { background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:8px 12px; font-size:12px; color:var(--text); outline:none; width:100%; }
    input[type="text"]:focus { border-color:var(--accent); }
    input[type="checkbox"] { accent-color:var(--accent); cursor:pointer; }

    /* ── Toggle switch ── */
    .sw { position:relative; width:36px; height:20px; flex-shrink:0; display:inline-block; cursor:pointer; }
    .sw input { opacity:0; width:0; height:0; }
    .sw-t { position:absolute; inset:0; background:var(--s3); border-radius:10px; border:1px solid var(--border2); transition:background .2s,border-color .2s; cursor:pointer; }
    .sw-b { position:absolute; top:2px; left:2px; width:14px; height:14px; background:var(--t3); border-radius:50%; transition:transform .2s,background .2s; pointer-events:none; }
    .sw input:checked ~ .sw-t { background:var(--accentbg); border-color:var(--accentbdr); }
    .sw input:checked ~ .sw-b { transform:translateX(16px); background:var(--accent); }

    /* ── Toggle row ── */
    .tog-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
    .tog-row:last-child { border-bottom:none; }
    .tog-lbl { font-size:13px; color:var(--text); }

    /* ── Pill group ── */
    .pill-grp { display:flex; flex-wrap:wrap; gap:6px; }
    .pill { font-size:11px; font-weight:500; padding:4px 11px; border-radius:20px; border:1px solid var(--border2); color:var(--t2); cursor:pointer; transition:all .15s; user-select:none; background:var(--s2); }
    .pill:hover { border-color:var(--accent); color:var(--accent); }
    .pill.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .pill.dim { opacity:.55; }
    .pill.dim:hover { opacity:1; }

    /* ── Sensor-chip picker (per-device / per-area overrides) ── */
    .chip-picker { display:flex; flex-direction:column; gap:8px; padding:8px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; }
    .chip-picker-hdr { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .chip-picker-state { font-size:11px; color:var(--t3); font-style:italic; }
    .chip-picker-grp { display:flex; flex-direction:column; gap:4px; }
    .chip-picker-grp-lbl { font-size:10px; font-weight:600; letter-spacing:.04em; }
    /* Naming entities sits below the class pills and is visibly a different
       kind of choice — the pills are a fixed vocabulary, this is anything. */
    .chip-picker-ents { margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); }
    .chip-picker-ents .chip-picker-grp-lbl { color:var(--t3); display:block; margin-bottom:4px; }

    /* ── Hint line ── */
    /* Helper text sits next to HA's 14px chrome; 11px italic muted was the
       single most common "I can't read the editor" complaint. */
    .hint { font-size:12.5px; line-height:1.45; color:var(--t2); font-style:normal; }
    .rooms-note { display:flex; gap:8px; align-items:flex-start; font-size:11px; line-height:1.5;
      color:var(--t2); background:var(--s3); border:1px solid var(--border); border-left:3px solid var(--amber, #f0a020);
      border-radius:6px; padding:8px 10px; margin-bottom:8px; }
    .rooms-note b { color:var(--text); font-weight:600; }
    .rooms-note-ico { flex-shrink:0; opacity:.8; }

    /* ── Subgroup label (inside sections) ── */
    .subgroup-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); opacity:0.8; margin:10px 0 4px; padding-top:6px; border-top:1px solid var(--border); }
    .subgroup-lbl:first-child { margin-top:0; padding-top:0; border-top:none; }

    /* ── Color row ── */
    .color-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .color-row:last-child { border-bottom:none; }
    .color-key { font-size:12px; color:var(--t2); flex:1; min-width:0; }
    .color-reset { font-size:11px; color:var(--t3); background:none; border:none; cursor:pointer; padding:2px 4px; border-radius:3px; transition:color .15s; }
    .sel-allnone { display:inline-flex; gap:4px; margin-left:6px; vertical-align:middle; }
    .sel-mini { font:inherit; font-size:10px; font-weight:600; letter-spacing:.02em; cursor:pointer; padding:2px 8px; border-radius:6px; color:var(--t2); background:var(--s2); border:1px solid var(--border); transition:all .15s; }
    .sel-mini:hover { color:var(--t1); border-color:var(--t3); }
    .color-reset:hover { color:var(--accent); }
    .field-reset { font-size:10px; color:var(--t3); background:none; border:none; cursor:pointer; padding:0 4px; margin-left:4px; border-radius:3px; transition:color .15s; vertical-align:middle; }
    .field-reset:hover { color:var(--accent); }
    .color-preview-swatch { width:20px; height:20px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }
    .sl-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .sl-row:last-child { border-bottom:none; }
    .sl-val { font-family:monospace; font-size:11px; color:var(--accent); min-width:36px; text-align:right; }
    .inline-text { flex:1; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:4px 8px; font-size:11px; color:var(--text); outline:none; min-width:0; }
    .inline-text.input-invalid { border-color:#f87171; }
    .input-err { color:#f87171; font-size:10px; margin-top:3px; }
    .font-select { width:100%; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:8px 10px; font-size:13px; color:var(--text); outline:none; cursor:pointer; }
    .font-select:focus { border-color:var(--accent); }
    .font-select option { background:var(--s2); color:var(--text); padding:4px 8px; }
    .font-select optgroup { font-weight:600; color:var(--t2); }
    .bg-img-row { display:flex; align-items:center; gap:6px; }
    .bg-thumb { width:32px; height:32px; border-radius:5px; border:1px solid var(--border2); background-size:cover; background-position:center; flex-shrink:0; background-color:var(--s3); }
    .bg-embedded-note { flex:1; font-size:11px; color:var(--t2); font-style:italic; padding:4px 8px; background:var(--s2); border:1px dashed var(--border); border-radius:6px; }
    .tiles-divider { font-size:10px; font-weight:600; color:var(--t2); letter-spacing:.06em; text-transform:uppercase; margin:12px 0 6px; padding-top:10px; border-top:1px solid var(--border); }
    .upload-btn { font-size:10px; background:var(--s2); border:1px solid var(--border2); border-radius:5px; color:var(--text); padding:3px 8px; cursor:pointer; white-space:nowrap; }

    /* ── Rooms toolbar ── */
    .rooms-toolbar { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border); }
    .toolbar-group { display:flex; align-items:center; gap:8px; }
    .toolbar-lbl { font-size:11px; color:var(--t3); min-width:34px; }

    /* ── Room rows ── */
    .room-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
    .room-row:last-of-type { border-bottom:none; }
    .room-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .room-name { font-size:13px; flex:1; }
    .room-count { font-size:10px; color:var(--t3); background:var(--s3); padding:2px 7px; border-radius:10px; }
    .room-style-btn { background:none; border:1px solid var(--border); color:var(--t3); border-radius:5px; font-size:10px; padding:3px 8px; cursor:pointer; transition:all .12s; flex-shrink:0; }
    .room-style-btn:hover { border-color:var(--accent); color:var(--accent); }
    .room-reset-btn { background:none; border:1px solid var(--border); color:var(--t3); border-radius:5px; font-size:11px; line-height:1; padding:3px 7px; cursor:pointer; transition:all .12s; flex-shrink:0; }
    .room-reset-btn:hover { border-color:var(--accent); color:var(--accent); }
    /* Header above a room's device list, carrying its All / None. Only drawn
       when the room holds more than one device — a two-button control over a
       single row is noise. */
    .room-devices-hdr { display:flex; align-items:center; padding:6px 8px 2px 12px; }
    .room-devices-lbl { font-size:11px; color:var(--t3); }
    .room-devices { padding:4px 0 4px 12px; border-bottom:1px solid var(--border); }
    .room-device-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); transition:background .15s; border-radius:4px; }
    .room-device-row.selected { background:rgba(244,96,30,0.08); border-color:var(--accent); padding-left:6px; padding-right:6px; }
    .room-device-row:last-child { border-bottom:none; }
    .room-style-btn.active { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }

    /* ── Device style side-panel ── */
    @keyframes slidein { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes fadein { from { opacity:0; } to { opacity:1; } }
    .room-device-name { flex:1; font-size:11px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .room-device-empty { font-size:11px; color:var(--t3); padding:6px 0; }
    .dev-style-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); flex-shrink:0; }

    /* Room expand button */
    .room-expand-btn { background:none; border:none; color:var(--t3); cursor:pointer; font-size:10px; padding:2px 4px; transition:transform .2s,color .15s; flex-shrink:0; }
    .room-expand-btn:hover { color:var(--t2); }
    .room-expand-btn.open { transform:rotate(180deg); color:var(--accent); }

    /* Favourites room row */
    .fav-room-row { border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:rgba(251,191,36,0.04); margin-bottom:2px; }
    .fav-room-star { font-size:13px; color:var(--amber); flex-shrink:0; }
    .fav-dev-area { font-size:9px; color:var(--t3); background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:3px; padding:1px 5px; flex-shrink:0; white-space:nowrap; }

    /* Room expanded container */
    .room-expanded { border:1px solid var(--border); border-radius:0 0 8px 8px; margin:-1px 0 4px; overflow:hidden; }

    /* Room style sub-section */

    /* Flat room style panel */
    .rsp-panel { padding:10px 12px; display:flex; flex-direction:column; gap:4px; background:var(--bg); }
    /* Input actions: one card per channel — name + action picker on the header
       line, then a two-column grid (fixed label column) for its settings, so
       the sub-rows line up instead of floating. Chosen entities are chips above
       ONE picker that adds another; HA's picker brings its own field chrome. */
    .ia-ch { border:1px solid var(--border); border-radius:8px; padding:8px 10px; margin-bottom:8px; background:var(--s1); }
    .ia-ch.set { border-color:color-mix(in srgb, var(--accent) 45%, var(--border)); }
    .ia-ch-hdr { display:flex; align-items:center; gap:10px; }
    .ia-ch-name { flex:0 0 34%; font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ia-grid { display:grid; grid-template-columns:84px minmax(0,1fr); gap:6px 10px; align-items:center; margin-top:8px; }
    .dsn-save-row { display:flex; align-items:center; gap:6px; margin:0 0 8px; }
    .rs-row { display:flex; align-items:center; gap:6px; margin:4px 0; }
    .rs-row .rs-name { flex:0 1 140px; }
    .rs-row .rs-url { flex:1; min-width:0; }
    /* Gauge ring colour block: header row, gradient bar, stops under the bar */
    .gg-row { padding:8px 0 10px; border-bottom:1px solid var(--border); }
    .gg-row:last-child { border-bottom:none; }
    .gg-hdr { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .gg-hdr .color-key { flex:1; min-width:120px; }
    .gg-bar { height:12px; border-radius:6px; margin:8px 0 6px; border:1px solid var(--border); }
    .gg-stops { display:flex; justify-content:space-between; align-items:flex-start; }
    .gg-stops.single { justify-content:flex-start; }
    .gg-stop { display:flex; flex-direction:column; align-items:center; gap:3px; font-size:10px; color:var(--t3); cursor:pointer; }
    /* Colour wheel */
    .cw-btn { width:36px; height:26px; padding:0; border:1px solid rgba(255,255,255,0.25); border-radius:5px; cursor:pointer; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.35); }
    .gg-stop .cw-btn { height:22px; }
    .cw-btn:hover { border-color:var(--accent); }
    .cw-pop { margin:auto; inset:0; width:min(280px, 92vw); padding:12px; background:var(--s1,#17171c); border:1px solid rgba(255,255,255,0.15); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,0.85); color:var(--text); }
    .cw-disc { position:relative; width:200px; height:200px; margin:0 auto 10px; border-radius:50%; touch-action:none; cursor:crosshair; user-select:none;
      background:radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 72%), conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
    .cw-disc::after { content:''; position:absolute; inset:0; border-radius:50%; background:#000; opacity:calc(1 - var(--cw-v, 1)); pointer-events:none; }
    .cw-dot { position:absolute; width:16px; height:16px; margin:-8px 0 0 -8px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 0 1px rgba(0,0,0,0.6); pointer-events:none; z-index:1; }
    .cw-row { display:flex; align-items:center; gap:8px; margin-top:8px; }
    .cw-lbl { font-size:10px; color:var(--t3); text-transform:uppercase; letter-spacing:.04em; }
    .cw-swatch { width:22px; height:22px; border-radius:5px; border:1px solid rgba(255,255,255,0.25); flex-shrink:0; }
    .cw-note { font-size:10px; color:var(--t2); background:var(--s3); border-radius:6px; padding:5px 8px; margin-bottom:8px; }
    .cw-presets { display:flex; gap:5px; flex-wrap:wrap; margin-top:10px; }
    .cw-preset { width:18px; height:18px; border-radius:4px; cursor:pointer; border:1px solid rgba(255,255,255,0.18); }
    .cw-preset.on, .cw-preset:hover { border-color:#fff; }
    .gg-stop:first-child { align-items:flex-start; }
    .gg-stop:last-child:not(:first-child) { align-items:flex-end; }
    .anim-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .anim-row .icon-picker-wrap { flex:0 1 150px; min-width:64px; }
    .anim-row .icon-picker-btn { width:100%; justify-content:center; }
    .anim-state { font-size:10px; font-weight:700; letter-spacing:.04em; color:var(--t2); }
    .ia-lbl { font-size:11.5px; color:var(--t2); }
    .ia-hint { grid-column:1 / -1; font-size:11.5px; color:var(--t2); margin:-2px 0 2px; }
    .ia-note { font-size:11px; color:var(--t3); margin-top:3px; }
    .ia-chips { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px; }
    .ia-chip { display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:2px 6px 2px 9px; border-radius:999px; background:var(--s2); border:1px solid var(--border); }
    .ia-chip-x { border:none; background:transparent; color:var(--t3); cursor:pointer; font-size:14px; line-height:1; padding:0 2px; }
    .ia-chip-x:hover { color:var(--text); }
    .ia-picker { display:block; width:100%; }
    .rsp-section-lbl { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin:8px 0 4px; padding-bottom:4px; border-bottom:1px solid var(--border); }
    .rsp-section-lbl:first-child { margin-top:0; }
    .fav-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--t3); padding:0 2px; line-height:1; transition:color .15s,transform .15s; flex-shrink:0; }
    .fav-btn:hover { color:var(--amber); transform:scale(1.2); }
    .fav-btn.on { color:var(--amber); }
    .dev-style-hint { font-size:11px; color:var(--t3); font-weight:400; letter-spacing:.04em; text-transform:none; }

    /* Sensor range table */
    .range-table { display:flex; flex-direction:column; gap:2px; }
    .range-hdr { display:grid; grid-template-columns:1fr 60px 60px 24px; gap:4px; padding:0 2px 4px; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--t3); border-bottom:1px solid var(--border); }
    .range-row { display:grid; grid-template-columns:1fr 60px 60px 24px; gap:4px; align-items:center; padding:3px 2px; border-radius:4px; }
    .range-row.set { background:rgba(251,191,36,0.06); }
    .range-lbl { font-size:11px; color:var(--t2); }
    .range-unit { font-size:9px; color:var(--t3); }
    .range-inp { width:100%; background:var(--s2); border:1px solid var(--border); border-radius:4px; padding:3px 5px; font-size:11px; color:var(--text); text-align:right; -moz-appearance:textfield; }
    .range-inp::-webkit-outer-spin-button, .range-inp::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
    .range-inp:focus { outline:none; border-color:var(--accent); }
    .range-inp::placeholder { color:var(--t3); }
    .lay-canvas { display:flex; flex-direction:column; gap:4px; }
    .lay-row { display:flex; flex-wrap:wrap; align-items:center; gap:4px; min-height:28px; padding:4px 6px;
      border:1px dashed var(--border); border-radius:6px; background:var(--s3); }
    .lay-row.lay-new { justify-content:center; font-size:10px; color:var(--t3); border-style:dotted; }
    /* touch-action:none — without it the browser claims the gesture for scrolling
       and pointermove never reaches us. Padding is a touch-sized target. */
    .lay-chip { font-size:10px; color:var(--text); background:var(--s2); border:1px solid var(--border2);
      border-radius:4px; padding:5px 9px; cursor:grab; user-select:none; touch-action:none; }
    .lay-chip:active { cursor:grabbing; }
    .lay-chip.off { color:var(--t3); border-color:var(--border); }
    .lay-chip.lay-dragging { opacity:.45; }
    .lay-row.lay-over, .lay-palette.lay-over { border-style:solid; border-color:var(--accent, #03a9f4); }
    .lay-slot { font-size:9px; color:var(--t3); opacity:.6; padding:0 4px; }
    .lay-palette { display:flex; flex-wrap:wrap; gap:4px; min-height:28px; padding:4px 6px;
      border:1px dashed var(--border); border-radius:6px; }
    .icon-picker-wrap { position:relative; display:inline-block; flex:1; }
    .icon-picker-btn { cursor:pointer; display:flex; align-items:center; gap:5px; padding:4px 8px; border-radius:6px; background:var(--s3,#1e1e1e); border:1px solid var(--border,#333); color:var(--text); min-height:26px; }
    .icon-picker-btn:hover { border-color:var(--acc,#f4601e); }
    .icon-grid-popover { margin:auto; inset:0; width:min(420px, 92vw); max-height:92vh; padding:12px; background:var(--s1,#17171c); border:1px solid rgba(255,255,255,0.15); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,0.85); color:var(--text); }
    .icon-grid-popover:popover-open { display:grid; grid-template-columns:repeat(8,1fr); gap:4px; }
    .icon-grid-popover::backdrop { background:rgba(0,0,0,0.3); }
    .icon-grid-cell { display:flex; flex-direction:column; align-items:center; gap:2px; padding:5px 3px; border:1px solid transparent; border-radius:5px; background:transparent; cursor:pointer; transition:background .1s,border-color .1s; }
    .icon-grid-cell:hover { background:rgba(255,255,255,0.07); }
    .icon-grid-lbl { font-size:8px; color:rgba(255,255,255,0.45); max-width:34px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
    .icon-grid-none { font-size:13px; color:rgba(255,255,255,0.3); }
    .icon-cell-none { font-size:1rem; color:var(--t3); }
    .icon-preview { width:20px; height:20px; display:block; }
    .icon-picker-btn.compact { padding:3px 5px; min-height:22px; justify-content:center; width:100%; }
    .icon-preview-sm { width:16px; height:16px; display:block; }
    .ent-icon-bulb.off .bulb-body,.ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2,
    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb2.off .bulb-filament { display:none; }
    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }


    /* ── Step buttons ── */
    .step-row { display:flex; align-items:center; gap:6px; }
    .step-btn { width:28px; height:28px; border:1px solid var(--border2); border-radius:5px; background:var(--s2); color:var(--t2); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; line-height:1; }
    .step-btn:hover { background:var(--s3); border-color:var(--accent); color:var(--text); }
    .step-val { font-family:monospace; font-size:13px; color:var(--text); min-width:28px; text-align:center; font-weight:500; }

    /* ── Drag list ── */

    /* ── Tile live preview ── */
    /* ── Tile block order preview ── */
    .tile-preview-live { background:#141418; border:1px solid var(--border); border-radius:10px; padding:8px 10px; margin-bottom:10px; display:flex; flex-direction:column; gap:0; position:relative; overflow:hidden; }
    .tile-preview-live::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,var(--accent),transparent); }
    /* A layout row in the preview. Multiple blocks on one row sit side by side,
       each an equal share, mirroring the .tile-row runtime rule. Separator sits
       on the row wrapper so it draws once per layout row, not per block. */
    .tp-prow { display:flex; align-items:stretch; gap:8px; border-bottom:1px solid rgba(255,255,255,0.04); }
    .tp-prow:last-child { border-bottom:none; }
    .tp-prow > * { flex:1 1 0; min-width:0; }
    .tp-row { display:flex; align-items:center; gap:6px; padding:3px 0; }
    .tp-name-row { justify-content:flex-start; }
    .tp-name { font-size:11px; font-weight:600; color:rgba(255,255,255,0.85); flex:1; }
    .tp-dot  { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .tp-tog  { font-size:9px; font-weight:700; padding:2px 8px; border-radius:10px; color:white; letter-spacing:0.06em; flex-shrink:0; }
    .tp-chips { flex-wrap:wrap; gap:4px; }
    .tp-chip { font-size:9px; padding:2px 6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:4px; color:rgba(255,255,255,0.55); }
    .tp-lbl  { font-size:9px; color:rgba(255,255,255,0.4); width:56px; flex-shrink:0; }
    .tp-val  { font-size:9px; color:rgba(255,255,255,0.5); width:32px; text-align:right; flex-shrink:0; }
    .tp-strack { flex:1; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden; }
    .tp-sfill  { height:100%; border-radius:2px; }
    .tp-btn  { font-size:9px; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); cursor:default; flex:1; text-align:center; }

    /* ── Graph preview ── */

    /* ── Button preview ── */
    .btn-preview { display:flex; gap:8px; align-items:center; padding:10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; margin-bottom:10px; }
    .preview-btn { font-size:11px; font-weight:700; letter-spacing:0.08em; padding:4px 12px; border-radius:20px; cursor:default; }
    .preview-btn.on { background:var(--accent); color:white; border:none; }
    .preview-btn.off { background:var(--s3); color:var(--t2); border:1px solid var(--border2); }

    /* ── Sensor grid ── */
    .sensors-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .sensors-hdr-lbl { font-size:11px; color:var(--t2); }
    .sensors-all-btn { background:rgba(244,96,30,0.12); color:#f4601e; border:1px solid rgba(244,96,30,0.3); border-radius:6px; padding:3px 10px; font-size:11px; cursor:pointer; }
    .sensors-all-btn:hover { background:rgba(244,96,30,0.22); }
    .sensor-graph-btn { margin-left:auto; flex-shrink:0; background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:var(--t2); font-size:13px; padding:1px 6px; cursor:pointer; line-height:1.4; transition:all .12s; }
    .sensor-graph-btn.on { background:rgba(74,158,255,0.18); border-color:#4a9eff; color:#4a9eff; }
    .sensor-graph-btn:hover { border-color:rgba(255,255,255,0.3); color:var(--text); }
    .sensor-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
    .sensor-item { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .12s; user-select:none; }
    .sensor-item:hover { border-color:var(--border2); background:var(--s3); }
    .sensor-item.active { border-color:var(--accentbdr); background:var(--accentbg); }
    .sensor-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; transition:background .2s; }
    .sensor-item-body { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
    .sensor-unit { font-size:9px; color:var(--t3); letter-spacing:0.03em; }
    .sensor-name { font-size:11px; color:var(--t2); }
    .sensor-item.active .sensor-name { color:var(--text); }

    /* ── YAML ── */
    .yaml-out { font-family:monospace; font-size:11px; line-height:1.7; color:var(--t2); background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:12px 14px; overflow-x:auto; white-space:pre; }
    .yaml-out::-webkit-scrollbar { height:4px; }
    .yaml-out::-webkit-scrollbar-thumb { background:var(--s3); border-radius:2px; }
    .btn-copy { font-size:11px; padding:4px 10px; border-radius:20px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; transition:all .15s; }
    .btn-copy:hover { background:var(--s3); color:var(--text); }
    .clip-feedback { font-size:11px; color:var(--t2); animation:fadeout 1.5s forwards; }
    @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }

    /* ── Views tab ── */
    .views-header { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 0 10px; }
    .empty-views { text-align:center; padding:24px 12px; color:var(--t2); font-size:13px; border:1px dashed var(--border); border-radius:8px; }
    .view-card { border:1px solid var(--border); border-radius:8px; margin-bottom:8px; background:var(--s2); overflow:hidden; }
    .view-card.expanded { border-color:var(--accentbdr); }
    .view-card-hdr { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; user-select:none; }
    .view-card-hdr:hover { background:var(--s3); }
    .view-card-icon { font-size:16px; width:20px; text-align:center; color:var(--accent); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .view-card-name { flex:1; font-size:13px; font-weight:600; color:var(--text); }
    .view-card-id { font-size:10px; color:var(--t3); font-family:monospace; }
    .view-card-count { font-size:10px; color:var(--t2); background:var(--s3); border:1px solid var(--border); border-radius:10px; padding:1px 7px; font-variant-numeric:tabular-nums; }
    .view-card-actions { display:flex; gap:3px; }
    .view-card-actions .vc-btn { background:transparent; border:1px solid var(--border2); color:var(--t2); border-radius:4px; padding:2px 6px; font-size:11px; cursor:pointer; transition:all .12s; }
    .view-card-actions .vc-btn:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); }
    .view-card-actions .vc-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .view-card-actions .vc-btn.danger:hover { border-color:#ef4444; color:#ef4444; }
    .view-card-actions .vc-btn.danger.armed { border-color:#ef4444; color:#fff; background:#ef4444; font-weight:600; }
    .view-card-chev { font-size:10px; color:var(--t3); }
    .view-card-body { padding:10px 14px 14px; border-top:1px solid var(--border); background:var(--s1); }
    .view-dev-list { max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; padding:6px; background:var(--s2); border:1px solid var(--border); border-radius:6px; }
    .view-dev-row { display:flex; align-items:center; gap:8px; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:12px; }
    .view-dev-row:hover { background:var(--s3); }
    .view-dev-name { flex:1; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .view-dev-area { font-size:10px; color:var(--t3); }

    /* ── Live style preview (Style tab top) ── */

    /* ── Tile style picker (per-room) ── */
    .ts-style-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; margin-top:6px; }
    .ts-style-btn { display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 4px 7px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .15s; text-align:center; }
    .ts-style-btn:hover { background:var(--s3); border-color:var(--border2); }
    .ts-style-btn.on { background:var(--accentbg); border-color:var(--accent); }
    .ts-style-icon  { font-size:14px; line-height:1; margin-bottom:1px; }
    .ts-style-label { font-size:10px; font-weight:600; color:var(--text); letter-spacing:0.03em; }
    .ts-style-desc  { font-size:9px; color:var(--t3); line-height:1.3; }
    .ts-style-btn.on .ts-style-label { color:var(--accent); }
  `],e([ve({attribute:!1})],To.prototype,"hass",void 0),e([fe()],To.prototype,"_config",void 0),e([fe()],To.prototype,"_tab",void 0),e([fe()],To.prototype,"_newStyleName",void 0),e([fe()],To.prototype,"_renamingStyle",void 0),e([fe()],To.prototype,"_advanced",void 0),e([fe()],To.prototype,"_defaultsOpen",void 0),e([fe()],To.prototype,"_resetArmed",void 0),e([fe()],To.prototype,"_viewDeleteArmed",void 0),e([fe()],To.prototype,"_xcPlacement",void 0),e([fe()],To.prototype,"_xcRoom",void 0),e([fe()],To.prototype,"_xcView",void 0),e([fe()],To.prototype,"_xcAdding",void 0),e([fe()],To.prototype,"_xcEditIndex",void 0),e([fe()],To.prototype,"_xcDraft",void 0),e([fe()],To.prototype,"_xcMode",void 0),e([fe()],To.prototype,"_xcFormEl",void 0),e([fe()],To.prototype,"_xcFormUnavailable",void 0),e([fe()],To.prototype,"_xcPreview",void 0),e([fe()],To.prototype,"_xcDashboards",void 0),e([fe()],To.prototype,"_xcImportCards",void 0),e([fe()],To.prototype,"_xcImportLoading",void 0),e([fe()],To.prototype,"_palettes",void 0),e([fe()],To.prototype,"_paletteNaming",void 0),e([fe()],To.prototype,"_paletteName",void 0),e([fe()],To.prototype,"_expandedViewIds",void 0),e([fe()],To.prototype,"_openSections",void 0),e([fe()],To.prototype,"_haPickersReady",void 0),e([fe()],To.prototype,"_iaAllEntities",void 0),e([fe()],To.prototype,"_expandedRooms",void 0),e([fe()],To.prototype,"_designScope",void 0),e([fe()],To.prototype,"_designGroupBy",void 0),e([fe()],To.prototype,"_designOpenGroups",void 0),e([fe()],To.prototype,"_changesOpen",void 0),e([fe()],To.prototype,"_changesResetArmed",void 0),e([fe()],To.prototype,"_selectedDeviceId",void 0),e([fe()],To.prototype,"_conflictsOpen",void 0),e([fe()],To.prototype,"_flashControl",void 0),e([fe()],To.prototype,"_snapshots",void 0),e([fe()],To.prototype,"_snapMenu",void 0),e([fe()],To.prototype,"_snapName",void 0),e([fe()],To.prototype,"_snapMsg",void 0),e([fe()],To.prototype,"_helpOpen",void 0),e([fe()],To.prototype,"_helpFilter",void 0),e([fe()],To.prototype,"_helpTopic",void 0),e([fe()],To.prototype,"_rolled",void 0),e([fe()],To.prototype,"_styleClipFeedback",void 0),e([fe()],To.prototype,"_openDiscDropdown",void 0),e([fe()],To.prototype,"_sciServer",void 0),e([fe()],To.prototype,"_sciKey",void 0),e([fe()],To.prototype,"_sciBusy",void 0),e([fe()],To.prototype,"_sciError",void 0),e([fe()],To.prototype,"_sciDone",void 0),e([fe()],To.prototype,"_sciData",void 0),e([fe()],To.prototype,"_sciRoomMap",void 0),e([fe()],To.prototype,"_sciOptRooms",void 0),e([fe()],To.prototype,"_sciOptDevices",void 0),e([fe()],To.prototype,"_sciOptStock",void 0),e([fe()],To.prototype,"_sciOptFull",void 0),e([fe()],To.prototype,"_iconPickerState",void 0),e([fe()],To.prototype,"_wheel",void 0),To=wo=e([he("ha-device-dashboard-editor")],To);let Io=class extends de{constructor(){super(...arguments),this.entity="",this._built=""}willUpdate(e){this.entity&&this.entity!==this._built&&this._build()}updated(){this._el&&this.hass&&(this._el.hass=this.hass)}async _build(){const e=this.entity;this._built=e;try{const t=window.loadCardHelpers,i=t?await t():void 0;if(!i||this.entity!==e)return;const s=i.createCardElement({type:"tile",entity:e,features:this.features??[]});this.hass&&(s.hass=this.hass),this._el=s}catch{this._el=void 0}}render(){return this._el??Y}};Io.styles=r`
    :host {
      display: block;
      /* dissolve the native card chrome so the control sits on our tile surface */
      --ha-card-background: transparent;
      --ha-card-border-width: 0;
      --ha-card-box-shadow: none;
      --ha-card-border-radius: 8px;
    }
  `,e([ve({attribute:!1})],Io.prototype,"hass",void 0),e([ve()],Io.prototype,"entity",void 0),e([ve({attribute:!1})],Io.prototype,"features",void 0),e([fe()],Io.prototype,"_el",void 0),Io=e([he("hdd-delegated")],Io);let Mo=class extends de{constructor(){super(...arguments),this.preview=!1,this._hui=null,this._builtKey=""}connectedCallback(){super.connectedCallback(),null===this._hui&&this._resolveWrapper()}async _resolveWrapper(){if(customElements.get("hui-card"))this._hui=!0;else{try{const e=window.loadCardHelpers;e&&await e()}catch{}this._hui=!!customElements.get("hui-card")}}willUpdate(e){if(!1!==this._hui)return;const t=this.config?JSON.stringify(this.config):"";t&&t!==this._builtKey&&this._build(t)}updated(){!1!==this._hui?this._mirrorHidden():this._el&&this.hass&&(this._el.hass=this.hass)}async _mirrorHidden(){const e=this.renderRoot.querySelector("hui-card");if(e){try{await e.updateComplete}catch{}this.hidden=!!e.hidden}}async _build(e){this._builtKey=e;try{const t=window.loadCardHelpers,i=t?await t():void 0;if(!i||JSON.stringify(this.config)!==e)return;const s=i.createCardElement(this.config);this.hass&&(s.hass=this.hass),this._el=s}catch{this._el=void 0}}render(){return null===this._hui?Y:this._hui?this.config?q`<hui-card .hass=${this.hass} .config=${this.config} .preview=${this.preview}></hui-card>`:Y:this._el??Y}};Mo.styles=r`
    :host { display: block; }
    /* An author :host rule beats the UA's [hidden] rule, so the host needs to
       opt back out explicitly — see _mirrorHidden. */
    :host([hidden]) { display: none; }
    :host > * { width: 100%; }
    /* hui-card carries no display of its own. When a visibility condition fails
       it hides itself with an INLINE display:none, and an inline style beats a
       stylesheet rule, so setting block here cannot defeat the hiding. */
    hui-card { display: block; }
  `,e([ve({attribute:!1})],Mo.prototype,"hass",void 0),e([ve({attribute:!1})],Mo.prototype,"config",void 0),e([ve({type:Boolean})],Mo.prototype,"preview",void 0),e([fe()],Mo.prototype,"_el",void 0),e([fe()],Mo.prototype,"_hui",void 0),Mo=e([he("hdd-card")],Mo);console.info("%c ha-device-dashboard %c entity-picker-2026-09-08 ","background:#c98a63;color:#1e1a17;font-weight:700;border-radius:3px 0 0 3px","background:#241f1b;color:#f3ece3;border-radius:0 3px 3px 0"),window.customCards=window.customCards||[],window.customCards.push({type:"ha-device-dashboard",name:"HA Device Dashboard",description:"Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.",preview:!0,documentationURL:"https://github.com/TheIcelandicguy/ha-device-dashboard-card"});
