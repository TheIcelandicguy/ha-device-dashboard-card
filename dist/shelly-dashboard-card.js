function e(e,t,s,i){var r,o=arguments.length,a=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,s,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(a=(o<3?r(a):o>3?r(t,s,a):r(t,s))||a);return o>3&&a&&Object.defineProperty(t,s,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,s=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let o=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new o(s,e,i)},n=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:g}=Object,u=globalThis,v=u.trustedTypes,b=v?v.emptyScript:"",m=u.reactiveElementPolyfillSupport,f=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?b:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},x=(e,t)=>!l(e,t),_={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const o=i?.call(this);r?.call(this,t),this.requestUpdate(e,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(s)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const s of i){const i=document.createElement("style"),r=t.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:y).toAttribute(t,s.type);this._$Em=e,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=i;const o=r.fromAttribute(t,e.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,s,i=!1,r){if(void 0!==e){const o=this.constructor;if(!1===i&&(r=this[e]),s??=o.getPropertyOptions(e),!((s.hasChanged??x)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:r},o){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[f("elementProperties")]=new Map,$[f("finalized")]=new Map,m?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=e=>e,S=w.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+P,T=`<${E}>`,O=document,M=()=>O.createComment(""),z=e=>null===e||"object"!=typeof e&&"function"!=typeof e,I=Array.isArray,B="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,F=/>/g,R=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,U=/"/g,L=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...s)=>({_$litType$:e,strings:t,values:s}))(1),G=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),V=new WeakMap,q=O.createTreeWalker(O,129);function K(e,t){if(!I(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const X=(e,t)=>{const s=e.length-1,i=[];let r,o=2===t?"<svg>":3===t?"<math>":"",a=D;for(let t=0;t<s;t++){const s=e[t];let n,l,c=-1,d=0;for(;d<s.length&&(a.lastIndex=d,l=a.exec(s),null!==l);)d=a.lastIndex,a===D?"!--"===l[1]?a=N:void 0!==l[1]?a=F:void 0!==l[2]?(L.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=R):void 0!==l[3]&&(a=R):a===R?">"===l[0]?(a=r??D,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?R:'"'===l[3]?U:H):a===U||a===H?a=R:a===N||a===F?a=D:(a=R,r=void 0);const p=a===R&&e[t+1].startsWith("/>")?" ":"";o+=a===D?s+T:c>=0?(i.push(n),s.slice(0,c)+C+s.slice(c)+P+p):s+P+(-2===c?t:p)}return[K(e,o+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class Y{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let r=0,o=0;const a=e.length-1,n=this.parts,[l,c]=X(e,t);if(this.el=Y.createElement(l,s),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=q.nextNode())&&n.length<a;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(C)){const t=c[o++],s=i.getAttribute(e).split(P),a=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:a[2],strings:s,ctor:"."===a[1]?te:"?"===a[1]?se:"@"===a[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(P)&&(n.push({type:6,index:r}),i.removeAttribute(e));if(L.test(i.tagName)){const e=i.textContent.split(P),t=e.length-1;if(t>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],M()),q.nextNode(),n.push({type:2,index:++r});i.append(e[t],M())}}}else if(8===i.nodeType)if(i.data===E)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=i.data.indexOf(P,e+1));)n.push({type:7,index:r}),e+=P.length-1}r++}}static createElement(e,t){const s=O.createElement("template");return s.innerHTML=e,s}}function Z(e,t,s=e,i){if(t===G)return t;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const o=z(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e),r._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(t=Z(e,r._$AS(e,t.values),r,i)),t}class J{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??O).importNode(t,!0);q.currentNode=i;let r=q.nextNode(),o=0,a=0,n=s[0];for(;void 0!==n;){if(o===n.index){let t;2===n.type?t=new Q(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new re(r,this,e)),this._$AV.push(t),n=s[++a]}o!==n?.index&&(r=q.nextNode(),o++)}return q.currentNode=O,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),z(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>I(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=Y.createElement(K(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new J(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new Y(e)),t}k(e){I(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const r of e)i===t.length?t.push(s=new Q(this.O(M()),this.O(M()),this,this.options)):s=t[i],s._$AI(r),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=W}_$AI(e,t=this,s,i){const r=this.strings;let o=!1;if(void 0===r)e=Z(this,e,t,0),o=!z(e)||e!==this._$AH&&e!==G,o&&(this._$AH=e);else{const i=e;let a,n;for(e=r[0],a=0;a<r.length-1;a++)n=Z(this,i[s+a],t,a),n===G&&(n=this._$AH[a]),o||=!z(n)||n!==this._$AH[a],n===W?e=W:e!==W&&(e+=(n??"")+r[a+1]),this._$AH[a]=n}o&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class se extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ie extends ee{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){if((e=Z(this,e,t,0)??W)===G)return;const s=this._$AH,i=e===W&&s!==W||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==W&&(s===W||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const oe=w.litHtmlPolyfillSupport;oe?.(Y,Q),(w.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;let ne=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let r=i._$litPart$;if(void 0===r){const e=s?.renderBefore??null;i._$litPart$=r=new Q(t.insertBefore(M(),e),e,void 0,s??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};ne._$litElement$=!0,ne.finalized=!0,ae.litElementHydrateSupport?.({LitElement:ne});const le=ae.litElementPolyfillSupport;le?.({LitElement:ne}),(ae.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x},pe=(e=de,t,s)=>{const{kind:i,metadata:r}=s;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),o.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const r=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,r,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];t.call(this,s),this.requestUpdate(i,r,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function he(e){return(t,s)=>"object"==typeof s?pe(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function ge(e){return he({...e,state:!0,attribute:!1})}const ue=1;let ve=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const be="important",me=" !"+be,fe=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends ve{constructor(e){if(super(e),e.type!==ue||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,s)=>{const i=e[s];return null==i?t:t+`${s=s.includes("-")?s:s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?s.removeProperty(e):s[e]=null);for(const e in t){const i=t[e];if(null!=i){this.ft.add(e);const t="string"==typeof i&&i.endsWith(me);e.includes("-")||t?s.setProperty(e,t?i.slice(0,-11):i,t?be:""):s[e]=i}}return G}});function ye(e){const t=e.entities??{},s=e.devices??{},i=Object.keys(t).length>0;return Object.values(e.states).filter(e=>{if(i){const i=t[e.entity_id];if(!i)return!1;if("shelly"===i.platform)return!0;const r=i.device_id;if(r){const e=s[r];if(e?.manufacturer?.toLowerCase().includes("shelly"))return!0}return!1}return e.entity_id.toLowerCase().includes("shelly")}).map(e=>({entity_id:e.entity_id,domain:e.entity_id.split(".")[0],state:e.state,attributes:e.attributes}))}function xe(e,t){const s=new Map;for(const i of t){const t=e.entities?.[i.entity_id],r=t?.device_id??we(i.entity_id);if(!s.has(r)){const o=e.devices?.[r],a=(o?.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/);s.set(r,{device_id:r,name:o?.name_by_user??o?.name??ke(i.entity_id),area:Se(e,o?.area_id??t?.area_id),model:o?.model,sw_version:o?.sw_version,ip:a?a[1]:void 0,isShelly:!0,entities:[]})}const o=s.get(r);o&&o.entities.push(i)}return Array.from(s.values()).sort((e,t)=>e.name.localeCompare(t.name))}const _e=new Set(["switch","light","cover","valve","climate","sensor","binary_sensor","fan","lock","media_player","vacuum","alarm_control_panel","update","button","number","select"]);function $e(e){const t=e.entities??{},s=e.devices??{},i=new Map;for(const r of Object.values(e.states)){const o=r.entity_id.split(".")[0];if(!_e.has(o))continue;const a=t[r.entity_id];if(!a?.device_id)continue;if(a.hidden_by)continue;const n=a.device_id;if(!i.has(n)){const t=s[n];if(!t)continue;const r=(t.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),o=(t.manufacturer??"").toLowerCase().includes("shelly");i.set(n,{device_id:n,name:t.name_by_user??t.name??n,area:Se(e,t.area_id??a.area_id),model:t.model,sw_version:t.sw_version,ip:r?r[1]:void 0,isShelly:o,entities:[]})}const l=i.get(n);l&&(l.isShelly||"shelly"!==a.platform||(l.isShelly=!0),l.entities.push({entity_id:r.entity_id,domain:o,state:r.state,attributes:r.attributes}))}return Array.from(i.values()).filter(e=>e.entities.length>0).sort((e,t)=>e.name.localeCompare(t.name))}function we(e){const t=e.split(".")[1]??e;return t.split("_").slice(0,-1).join("_")||t}function ke(e){const t=e.split(".")[1]??e;return t.split("_").slice(0,-1).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")||t}function Se(e,t){if(!t)return;const s=e.areas?.[t];return s?.name}function Ae(e){const t=(e.model??"").toLowerCase(),s=new Set(e.entities.map(e=>e.domain));let i;if(s.has("climate")&&s.has("switch"))i="wall_display";else if(s.has("climate"))i="trv";else if(s.has("cover"))i="cover";else if(s.has("valve"))i="valve";else if(s.has("light")){const t=e.entities.some(e=>{if("light"!==e.domain)return!1;return(e.attributes?.supported_color_modes??[]).some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))});i=t?"rgb":"dimmer"}else if(s.has("switch"))i=t.includes("uni")?"uni":!t.includes("plug")&&(e.entities.some(e=>"binary_sensor"===e.domain&&e.entity_id.includes("input"))||t.includes("1pm")||t.includes("2pm")||t.includes("pro "))?"relay":"plug";else{const t=e.entities.some(e=>"sensor"===e.domain&&("power"===e.attributes?.device_class||"energy"===e.attributes?.device_class||"apparent_power"===e.attributes?.device_class)),s=e.entities.some(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||null==e.attributes?.device_class||e.entity_id.includes("button"))),r=e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","illuminance","moisture","battery","gas"].includes(e.attributes?.device_class??"")),o=e.entities.some(e=>"binary_sensor"===e.domain&&["motion","door","window","moisture","smoke","gas","vibration","opening"].includes(e.attributes?.device_class??""));i=t?"energy":!s||r||o?"sensor":"input"}const r=function(e){const t=e.toLowerCase();return t.includes("blu")||t.includes("bluetooth")?"ble":t.includes("g4")||t.includes("gen4")||t.includes("gen 4")?4:t.includes("g3")||t.includes("gen3")||t.includes("gen 3")?3:t.includes("plus")||t.includes("pro")||/^sn/i.test(e)?2:/^s3/i.test(e)?3:1}(e.model??"");return{type:i,gen:r,label:{relay:"Relay",dimmer:"Dimmer",rgb:"RGB",plug:"Plug",cover:"Roller",valve:"Valve",energy:"Energy",sensor:"Sensor",input:"Input",trv:"TRV",wall_display:"Display",uni:"UNI",unknown:""}[i]}}function Ce(e){return e>=1e3?`${(e/1e3).toFixed(2)} kW`:`${e.toFixed(1)} W`}function Pe(e){return`${e.toFixed(3)} kWh`}function Ee(e){return`${e.toFixed(1)} V`}function Te(e){return`${e.toFixed(3)} A`}function Oe(e){return`${e.toFixed(1)} °C`}function Me(e){return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}function ze(e){return e>=-50?"Excellent":e>=-60?"Good":e>=-70?"Fair":"Poor"}function Ie(e){return`${e.toFixed(1)} VA`}function Be(e){return`${e.toFixed(1)} VAr`}function De(e){return`${e.toFixed(2)} Hz`}function Ne(e){return`${e.toFixed(1)} %`}function Fe(e){return e>=1e4?`${(e/1e3).toFixed(1)} klx`:`${Math.round(e)} lx`}function Re(e){return`${Math.round(e)} ppm`}function He(e){return`${Math.round(e)} %`}var Ue;let Le=Ue=class extends ne{constructor(){super(...arguments),this._expandedDevice=null,this._closedAreas=new Set,this._entityListOpen=new Set,this._searchTerm="",this._bulkMode=!1,this._selectedDevices=new Set,this._sortBy="name",this._viewMode="grid",this._glowEnabled=!0,this._graphData=new Map,this._graphFetching=new Set,this._graphFetchedAt=new Map}static getConfigElement(){return document.createElement("shelly-card-editor")}static getStubConfig(){return{type:"custom:shelly-dashboard-card"}}setConfig(e){this._config=e,this._sortBy=e.sort_by??"name",this._viewMode=e.view_mode??"grid",this._glowEnabled=e.show_glow??!0}getCardSize(){return 6}static getLayoutOptions(){return{grid_columns:4,grid_rows:6,grid_min_columns:2,grid_min_rows:3}}_getDevices(){if(!this.hass)return[];let e=this._config.include_all?$e(this.hass):xe(this.hass,ye(this.hass));const t=this._config.areas;if(t&&t.length>0){const s=new Set(t.map(e=>e.toLowerCase()));e=e.filter(e=>s.has((e.area??"").toLowerCase()))}!1===this._config.show_offline&&(e=e.filter(e=>this._isOnline(e))),!0===this._config.hide_shelly&&(e=e.filter(e=>!e.isShelly));const s=this._config.hidden_devices;if(s&&s.length>0){const t=new Set(s);e=e.filter(e=>!t.has(e.device_id))}return e}_groupByArea(e){const t=new Map;for(const s of e){const e=s.area??"";t.has(e)||t.set(e,[]),t.get(e).push(s)}return new Map([...t.entries()].sort(([e],[t])=>e?t?e.localeCompare(t):-1:1).map(([e,t])=>{const s=this._sortBy;return[e,t.sort("power"===s?(e,t)=>(this._getPower(t)??-1)-(this._getPower(e)??-1):"online"===s?(e,t)=>(this._isOnline(t)?1:0)-(this._isOnline(e)?1:0)||e.name.localeCompare(t.name):(e,t)=>e.name.localeCompare(t.name))]}))}_isOnline(e){return e.entities.some(e=>{const t=this.hass.states[e.entity_id];return t&&"unavailable"!==t.state&&"unknown"!==t.state})}_getPower(e){let t=0,s=!1;for(const i of e.entities){const e=this.hass.states[i.entity_id];if(!e)continue;const r=e.attributes;if(null!=r.current_power_w){const e=Number(r.current_power_w);isNaN(e)||(t+=e,s=!0);continue}if("sensor"===i.domain&&"power"===r.device_class){const i=parseFloat(e.state);isNaN(i)||(t+=i,s=!0)}}return s?t:null}_getPrimarySwitch(e){for(const t of e.entities)if("switch"===t.domain||"light"===t.domain){const e=this.hass.states[t.entity_id];if(!e)continue;const s=e.attributes,i="light"===t.domain?"on"===e.state&&null!=s?.brightness?Math.round(s.brightness/Ue.BRIGHTNESS_MAX*100):0:void 0;let r,o,a;if("light"===t.domain){const e=s?.supported_color_modes??[];if(e.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(r=e),s?.rgbw_color){const[e,t,i,r]=s.rgbw_color;o=[e,t,i],a=r}else s?.rgb_color&&(o=s.rgb_color)}return{entityId:t.entity_id,isOn:"on"===e.state,brightness:i,colorModes:r,rgbColor:o,whiteValue:a}}return null}_getSwitches(e){return e.entities.filter(e=>"switch"===e.domain||"light"===e.domain).map(e=>{const t=this.hass.states[e.entity_id],s=t?.attributes;let i,r,o,a;if("light"===e.domain){i="on"===t?.state&&null!=s?.brightness?Math.round(s.brightness/Ue.BRIGHTNESS_MAX*100):0;const e=s?.supported_color_modes??[];if(e.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(r=e),s?.rgbw_color){const[e,t,i,r]=s.rgbw_color;o=[e,t,i],a=r}else s?.rgb_color&&(o=s.rgb_color)}return{entityId:e.entity_id,name:s?.friendly_name??e.entity_id.split(".")[1],isOn:"on"===t?.state,brightness:i,colorModes:r,rgbColor:o,whiteValue:a}})}_getTrv(e){const t=e.entities.find(e=>"climate"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;let r=i?.current_valve_position??i?.valve_position;if(null==r){const t=e.entities.find(e=>"sensor"===e.domain&&(e.entity_id.includes("valve")||e.entity_id.includes("position")));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(r=e)}}return{entityId:t.entity_id,currentTemp:i?.current_temperature,targetTemp:i?.temperature,minTemp:i?.min_temp??4,maxTemp:i?.max_temp??30,step:i?.target_temp_step??.5,hvacMode:s.state,hvacAction:i?.hvac_action??s.state,presetMode:i?.preset_mode,presetModes:(i?.preset_modes??[]).filter(e=>"none"!==e),valvePosition:r}}_isPrivateIp(e){return/^10\./.test(e)||/^192\.168\./.test(e)||/^172\.(1[6-9]|2\d|3[01])\./.test(e)||/^169\.254\./.test(e)}_rgbToHex(e,t,s){return"#"+[e,t,s].map(e=>e.toString(16).padStart(2,"0")).join("")}_hexToRgb(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}_getSensors(e){const t=this._config.sensors&&this._config.sensors.length>0?new Set(this._config.sensors):null,s=e=>!t||t.has(e),i=[],r=new Set,o=(e,t,s,o=!1)=>{r.has(e)||(r.add(e),i.push({label:t,value:s,warn:o}))};for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes.device_class??"",r=t.entity_id;if("sensor"===t.domain){if(!i&&(r.endsWith("_ip")||r.endsWith("_ip_address"))&&s("ip")){o("ip","IP Address",e.state);continue}if(!i&&r.endsWith("_ssid")&&s("ssid")){o("ssid","SSID",e.state);continue}if(!i&&(r.endsWith("_firmware")||r.endsWith("_fw_version"))&&s("fw_version")){o("fw_version","Firmware",e.state);continue}if(!i&&r.endsWith("_mac")&&s("mac")){o("mac","MAC",e.state);continue}const t=parseFloat(e.state);if(isNaN(t))continue;"power"===i&&s("power")?o("power","Power",Ce(t)):"apparent_power"===i&&s("apparent_power")?o("apparent_power","App. Power",Ie(t)):"reactive_power"===i&&s("reactive_power")?o("reactive_power","React. Power",Be(t)):"power_factor"===i&&s("power_factor")?o("power_factor","Pwr Factor",He(t)):"frequency"===i&&s("frequency")?o("frequency","Frequency",De(t)):"energy"===i&&s("energy")?o("energy","Energy",Pe(t)):"voltage"===i&&s("voltage")?o("voltage","Voltage",Ee(t)):"current"===i&&s("current")?o("current","Current",Te(t)):"temperature"===i&&s("temperature")?o("temperature","Temp",Oe(t)):"humidity"===i&&s("humidity")?o("humidity","Humidity",Ne(t)):"illuminance"===i&&s("illuminance")?o("illuminance","Light",Fe(t)):"carbon_dioxide"===i&&s("co2")?o("co2","CO₂",Re(t)):"gas"===i&&s("gas")?o("gas","Gas",`${t.toFixed(1)} %`):"battery"===i&&s("battery")?o("battery","Battery",He(t)):("signal_strength"===i||r.includes("rssi"))&&s("rssi")?o("rssi","Wi-Fi",`${ze(t)} (${t} dBm)`):r.includes("uptime")&&s("uptime")&&o("uptime","Uptime",Me(t))}else if("binary_sensor"===t.domain){const t="on"===e.state;"motion"===i&&s("motion")?o("motion","Motion",t?"Motion":"Clear"):"door"!==i&&"window"!==i&&"opening"!==i||!s("door")?"moisture"===i&&s("flood")?o("flood","Flood",t?"Flooded":"Dry",t):"smoke"===i&&s("smoke")?o("smoke","Smoke",t?"Smoke!":"Clear",t):"gas"===i&&s("gas")?o("gas","Gas",t?"Gas!":"Clear",t):"vibration"===i&&s("vibration")?o("vibration","Vibration",t?"Vibrating":"Clear"):("heat"===i||r.includes("overtemperature"))&&s("overtemp")?o("overtemp","Overtemp",t?"Overtemp!":"OK",t):("safety"===i||r.includes("overpower"))&&s("overpower")?o("overpower","Overpower",t?"Overpower!":"OK",t):"connectivity"===i&&r.includes("cloud")&&s("cloud")?o("cloud","Cloud",t?"Connected":"Offline",!t):"connectivity"===i&&r.includes("mqtt")&&s("mqtt")?o("mqtt","MQTT",t?"Connected":"Offline",!t):"connectivity"===i&&r.includes("eth")&&s("eth")&&o("eth","Ethernet",t?"Connected":"Offline",!t):o("door","Door/Win",t?"Open":"Closed")}}return i}_getFirmware(e){for(const t of e.entities){if("update"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e||"on"!==e.state)return null;const s=e.attributes;return{entityId:t.entity_id,current:s.installed_version??"",newVersion:s.latest_version}}return null}async _toggle(e,t,s){s.stopPropagation();const i=e.split(".")[0];await this.hass.callService(i,t?"turn_off":"turn_on",{entity_id:e})}async _installUpdate(e,t){t.stopPropagation(),await this.hass.callService("update","install",{entity_id:e})}async _setBrightness(e,t){await this.hass.callService("light","turn_on",{entity_id:e,brightness_pct:Math.max(1,Math.min(100,t))})}async _setColor(e,t,s,i=!1){const r=this._hexToRgb(t);i&&void 0!==s?await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...r,s]}):await this.hass.callService("light","turn_on",{entity_id:e,rgb_color:r})}async _setWhite(e,t,s){const i=Math.round(Math.max(0,Math.min(100,t))*Ue.BRIGHTNESS_MAX/100),r=s??[255,255,255];await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...r,i]})}async _setTemp(e,t){await this.hass.callService("climate","set_temperature",{entity_id:e,temperature:Math.round(2*t)/2})}async _setHvacMode(e,t,s){s.stopPropagation(),await this.hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}async _setPresetMode(e,t,s){s.stopPropagation(),await this.hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}_getCover(e){const t=e.entities.find(e=>"cover"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];return s?{entityId:t.entity_id,state:s.state,position:s.attributes?.current_position}:null}async _coverAction(e,t,s){s.stopPropagation();await this.hass.callService("cover",{open:"open_cover",close:"close_cover",stop:"stop_cover"}[t],{entity_id:e})}async _setCoverPosition(e,t){await this.hass.callService("cover","set_cover_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}_getValve(e){const t=e.entities.find(e=>"valve"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;let i,r=s.attributes?.current_position;if(null==r){const t=e.entities.find(e=>"sensor"===e.domain&&(e.entity_id.includes("posision")||e.entity_id.includes("position")));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(r=e)}}const o=e.entities.find(e=>{if("sensor"!==e.domain)return!1;const t=this.hass.states[e.entity_id];return"temperature"===t?.attributes?.device_class||e.entity_id.includes("temperture")||e.entity_id.includes("temperature")});if(o){const e=parseFloat(this.hass.states[o.entity_id]?.state??"");isNaN(e)||(i=e)}return{entityId:t.entity_id,state:s.state,position:r,temperature:i}}async _valveAction(e,t,s){s.stopPropagation();await this.hass.callService("valve",{open:"open_valve",close:"close_valve",stop:"stop_valve"}[t],{entity_id:e})}async _setValvePosition(e,t){await this.hass.callService("valve","set_valve_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}_getInputChannels(e){return e.entities.filter(e=>{if("binary_sensor"!==e.domain)return!1;const t=e.attributes?.device_class;return e.entity_id.includes("input")||e.entity_id.includes("button")||null==t}).map(e=>{const t=this.hass.states[e.entity_id],s=t?.attributes?.friendly_name??"",i=e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i)??s.match(/(\d+)\s*$/),r=i?parseInt(i[1]):0,o=i?`${r}`:s.split(" ").pop()??"?";return{entityId:e.entity_id,label:o,fullName:s||o,isOn:"on"===t?.state,channel:r}}).sort((e,t)=>e.channel-t.channel)}_getGraphEntities(e){const t=this._config.graph_sensors;if(!t?.length)return[];const s=[];for(const i of t){const t=e.entities.find(e=>{if("sensor"!==e.domain)return!1;return(this.hass.states[e.entity_id]?.attributes?.device_class??e.attributes?.device_class)===i});if(t){const e=this.hass.states[t.entity_id]?.attributes?.unit_of_measurement??"";s.push({entityId:t.entity_id,label:Ue.GRAPH_DC_LABELS[i]??i,dc:i,unit:e})}}return s}_requestGraphData(e){if(this._graphFetching.has(e))return;Date.now()-(this._graphFetchedAt.get(e)??0)<3e5&&this._graphData.has(e)||this._fetchGraphData(e)}async _fetchGraphData(e){this._graphFetching.add(e);try{const t=this._config.graph_hours??24,s=`history/period/${new Date(Date.now()-60*t*60*1e3).toISOString()}?filter_entity_id=${e}&minimal_response=true&no_attributes=true`,i=await this.hass.callApi("GET",s);if(i?.[0]){const t=i[0].map(e=>({t:new Date(e.last_changed).getTime(),v:parseFloat(e.state)})).filter(e=>!isNaN(e.v)),s=new Map(this._graphData);s.set(e,t),this._graphData=s,this._graphFetchedAt.set(e,Date.now())}}catch(t){console.warn("[shelly-card] history fetch failed for",e,t)}finally{this._graphFetching.delete(e)}}_renderSparklines(e){const t=this._getGraphEntities(e);if(!t.length)return W;const s=200,i=t.map(({entityId:e,label:t,unit:i})=>{this._requestGraphData(e);const r=this._graphData.get(e);if(!r||r.length<2)return j`
          <div class="spark-row">
            <span class="spark-lbl">${t}</span>
            <div class="sparkline-loading"></div>
            <span class="spark-val">—</span>
          </div>`;const o=r.map(e=>e.v),a=Math.min(...o),n=Math.max(...o)-a||1,l=r[0].t,c=r[r.length-1].t-l||1,d=r.map(e=>{const t=(e.t-l)/c*s,i=30-(e.v-a)/n*28;return`${t.toFixed(1)},${i.toFixed(1)}`}).join(" "),p=`sg-${e.replace(/[^a-z0-9]/gi,"")}`,h=((r[0].t-l)/c*s).toFixed(1),g=o[o.length-1],u=g%1==0?`${g}`:g.toFixed(1);return j`
        <div class="spark-row">
          <span class="spark-lbl">${t}</span>
          <svg viewBox="0 0 ${s} ${32}" preserveAspectRatio="none" class="sparkline-svg">
            <defs>
              <linearGradient id="${p}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--shelly-orange)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--shelly-orange)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="${d} ${s},${30} ${h},${30}"
              fill="url(#${p})"/>
            <polyline points="${d}" fill="none"
              stroke="var(--shelly-orange)" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="spark-val">${u} ${i}</span>
        </div>`});return j`<div class="sparklines-block" @click=${e=>e.stopPropagation()}>${i}</div>`}_clickTile(e,t){if(this._bulkMode)return t.stopPropagation(),void this._toggleBulkSelect(e.device_id);if("toggle"===this._config.tile_click){const s=this._getPrimarySwitch(e);return void(s&&this._toggle(s.entityId,s.isOn,t))}this._expandedDevice=this._expandedDevice===e.device_id?null:e.device_id}_expandTile(e,t){t.stopPropagation(),this._expandedDevice=this._expandedDevice===e?null:e}_toggleArea(e){const t=new Set(this._closedAreas);t.has(e)?t.delete(e):t.add(e),this._closedAreas=t}_getAlerts(e){const t=[];for(const s of e.entities){if("binary_sensor"!==s.domain)continue;const e=this.hass.states[s.entity_id];if(!e||"on"!==e.state)continue;const i=e.attributes.device_class??"",r=s.entity_id;"heat"===i||r.includes("overtemperature")||r.includes("overtemp")?t.push("overtemp"):("safety"===i||r.includes("overpower"))&&t.push("overpower")}return t}_toggleBulkSelect(e){const t=new Set(this._selectedDevices);t.has(e)?t.delete(e):t.add(e),this._selectedDevices=t}async _bulkToggle(e){const t=this._getDevices();for(const s of this._selectedDevices){const i=t.find(e=>e.device_id===s);if(!i)continue;const r=this._getPrimarySwitch(i);r&&await this.hass.callService(r.entityId.split(".")[0],e?"turn_on":"turn_off",{entity_id:r.entityId})}}render(){if(!this._config||!this.hass)return j``;const e=this._getDevices(),t=this._config.include_all??!1,s=t?"All Devices":"Shelly Devices";if(!e.length)return j`
        <ha-card>
          <div class="empty">
            <p>No ${t?"":"Shelly "}devices found.</p>
            <p class="hint">Devices are auto-discovered via the Home Assistant entity registry.</p>
          </div>
        </ha-card>
      `;const i=e.filter(e=>this._isOnline(e)).length,r=e.length-i,o=e.reduce((e,t)=>e+(this._getPower(t)??0),0),a=e.filter(e=>this._getAlerts(e).length>0),n=this._groupByArea(e);return j`
      <ha-card>
        <div class="dash-header">
          <span class="dash-title">${s}</span>
          <div class="dash-stats">
            <span class="stat online">${i}/${e.length} online</span>
            ${r>0?j`<span class="stat offline-count">${r} offline</span>`:W}
            <span class="stat power">${Ce(o)}</span>
            ${a.length>0?j`<span class="stat alerts-count">⚠ ${a.length}</span>`:W}
          </div>
        </div>
        ${this._renderSearchBar()}
        ${this._bulkMode&&this._selectedDevices.size>0?this._renderBulkActions():W}
        <div class="dash-body">
          ${[...n.entries()].map(([e,t])=>this._renderAreaSection(e,t))}
        </div>
      </ha-card>
    `}_renderAreaSection(e,t){const s=e||"No Area",i=this._searchTerm?t.filter(e=>e.name.toLowerCase().includes(this._searchTerm.toLowerCase())):t;if(!i.length)return j``;const r=this._closedAreas.has(e),o=i.filter(e=>this._isOnline(e)).length,a=i.reduce((e,t)=>e+(this._getPower(t)??0),0),n=this._config.area_styles?.[s],l=n?.columns??this._config.columns??3,c={};if(n){if(n.bgImage){const e={contain:"contain",cover:"cover",stretch:"100% 100%"};c.backgroundImage=`url('${n.bgImage}')`,c.backgroundSize=e[n.bgImageSize??"contain"]??"contain",c.backgroundPosition="center center",c.backgroundRepeat="no-repeat",c.overflow="hidden"}else n.bgColor&&(c.background=n.bgColor);(n.borderColor||n.borderWidth||n.borderStyle)&&(c.border=`${n.borderWidth??1}px ${n.borderStyle??"solid"} ${n.borderColor??"var(--divider-color)"}`),n.borderRadius&&(c.borderRadius=`${n.borderRadius}px`,c.overflow="hidden"),n.headerBgColor&&(c["--area-header-bg"]=n.headerBgColor2?`linear-gradient(${n.headerBgDir??"to right"}, ${n.headerBgColor}, ${n.headerBgColor2})`:n.headerBgColor),n.headerTextColor&&(c["--area-header-color"]=n.headerTextColor),n.textColor&&(c["--area-header-color"]=n.textColor),n.fontSize&&(c["--area-name-size"]=`${n.fontSize}px`),n.fontWeight&&(c["--area-name-weight"]=n.fontWeight),n.fontStyle&&(c["--area-name-style"]=n.fontStyle),n.tileBgColor&&(c["--sc-tile-bg"]=n.tileBgColor),n.tileBorderColor&&(c["--sc-tile-border"]=n.tileBorderColor);const e={soft:"0 2px 8px rgba(0,0,0,.18)",medium:"0 4px 16px rgba(0,0,0,.28)",strong:"0 8px 32px rgba(0,0,0,.45)"};n.boxShadow&&"none"!==n.boxShadow&&(c.boxShadow=e[n.boxShadow]??"")}return j`
      <div class="area-section ${r?"closed":""}" style=${fe(c)}>
        <div class="area-header" @click=${()=>this._toggleArea(e)}>
          <span class="area-name">${s}</span>
          <div class="area-meta">
            <span class="area-count">${o}/${i.length}</span>
            ${a>0?j`<span class="area-power">${Ce(a)}</span>`:W}
            <span class="chevron ${r?"":"open"}">▼</span>
          </div>
        </div>
        ${r?W:"list"===this._viewMode?j`<div class="device-list">${i.map(e=>this._renderListRow(e))}</div>`:j`<div class="device-grid" style="--cols:${l}">${i.map(e=>this._renderTile(e))}</div>`}
      </div>
    `}_renderTile(e){const t=this._isOnline(e),s=this._getPower(e),i=this._getPrimarySwitch(e),r=this._getTrv(e),o=this._getCover(e),a=this._getValve(e),n=Ae(e),l=this._expandedDevice===e.device_id,c=this._getFirmware(e),d=void 0!==i?.brightness,p=d&&i.isOn?Math.max(1,i.brightness??1):0,h=!!i?.colorModes?.length,g=h&&i.rgbColor?this._rgbToHex(...i.rgbColor):"#ffffff",u=h&&(i.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),v="heat"===r?.hvacMode,b="opening"===o?.state||"closing"===o?.state,m=!!o&&("open"===o.state||(o.position??0)>0),f=!!a&&("open"===a.state||(a.position??0)>0),y="input"===n.type?this._getInputChannels(e):[],x=a?this.hass.states[a.entityId]?.attributes?.friendly_name??a.entityId.split(".")[1].replace(/_/g," "):"",_="ble"===n.gen?"BLE":`G${n.gen}`,$=this._getAlerts(e),w=this._config.tile_size??"md",k=this._bulkMode&&this._selectedDevices.has(e.device_id),S=this._config.device_styles?.[e.device_id]?.color,A={};return S&&(A.borderColor=S,A.boxShadow=`0 0 12px ${S}50`),j`
      <div
        class="tile ${l?"expanded":""} ${t?"":"offline"} ${this._glowEnabled&&(i?.isOn||v||m||f)?"glow-on":""} ${k?"selected":""} tile-${w}"
        style=${fe(A)}
        @click=${t=>this._clickTile(e,t)}
      >
        <div class="tile-top">
          <div class="tile-left">
            ${this._bulkMode?j`
              <input type="checkbox" class="bulk-check"
                .checked=${k}
                @click=${t=>{t.stopPropagation(),this._toggleBulkSelect(e.device_id)}}
              />
            `:W}
            <span class="dot ${t?"online":"offline"}"></span>
            <span class="tile-name">${e.name}</span>
            ${c?j`<span class="update-dot" title="Firmware update available">●</span>`:W}
          </div>
          ${"toggle"===this._config.tile_click?j`
            <button class="tile-expand-btn ${l?"active":""}"
              @click=${t=>this._expandTile(e.device_id,t)} title="Expand">⊕</button>
          `:W}
          ${o?j`
            <div class="cov-btns" @click=${e=>e.stopPropagation()}>
              <button class="cov-btn" title="Open"
                @click=${e=>this._coverAction(o.entityId,"open",e)}>▲</button>
              <button class="cov-btn stop" title="Stop"
                @click=${e=>this._coverAction(o.entityId,"stop",e)}>■</button>
              <button class="cov-btn" title="Close"
                @click=${e=>this._coverAction(o.entityId,"close",e)}>▼</button>
            </div>
          `:i?j`
            <button
              class="tog ${i.isOn?"on":"off"}"
              @click=${e=>this._toggle(i.entityId,i.isOn,e)}
            >${i.isOn?"ON":"OFF"}</button>
          `:r?j`
            <button
              class="tog ${v?"on":"off"}"
              @click=${e=>this._setHvacMode(r.entityId,v?"off":"heat",e)}
            >${v?"HEAT":"OFF"}</button>
          `:W}
        </div>

        <!-- Cover position bar -->
        ${o?j`
          <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill ${b?"moving":""}"
                style="width: ${o.position??("open"===o.state?100:0)}%"></div>
            </div>
            <span class="cov-pct">${null!=o.position?`${Math.round(o.position)}%`:o.state}</span>
          </div>
        `:W}

        <!-- Valve body: matches expanded Water Valve section -->
        ${a?j`
          <div class="tile-valve-body" @click=${e=>e.stopPropagation()}>
            <div class="tile-valve-ename">${x}</div>
            <div class="trv-mode-row" style="margin-bottom:0">
              <button class="tog sm ${"open"===a.state?"on":"off"}" style="flex:1"
                @click=${e=>this._valveAction(a.entityId,"open",e)}>Open</button>
              <button class="tog sm off" style="flex:1"
                @click=${e=>this._valveAction(a.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===a.state?"on":"off"}" style="flex:1"
                @click=${e=>this._valveAction(a.entityId,"close",e)}>Close</button>
            </div>
            ${null!=a.position?j`
              <div class="dim-wrap" style="margin-top:4px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="1"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(a.position)}
                  @input=${e=>{const t=e.target,s=t.closest(".tile-valve-body")?.querySelector(".cov-pos-disp");s&&(s.textContent=`${t.value}%`)}}
                  @change=${e=>{e.stopPropagation(),this._setValvePosition(a.entityId,parseFloat(e.target.value))}}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top:2px">
                Position: <span class="cov-pos-disp">${Math.round(a.position)}%</span>
              </div>
            `:W}
            ${null!=a.temperature?j`
              <div class="trv-valve-row" style="margin-top:4px">
                <span class="sensor-label">Temperature</span>
                <span class="sensor-value">${a.temperature.toFixed(1)} °C</span>
              </div>
            `:W}
          </div>
        `:W}

        <!-- Input channels for i3/i4 devices -->
        ${y.length?j`
          <div class="tile-inputs" @click=${e=>e.stopPropagation()}>
            ${y.map(e=>j`
              <div class="input-chip ${e.isOn?"active":""}">
                <span class="input-dot"></span>
                <span class="input-lbl">${e.label}</span>
              </div>
            `)}
          </div>
        `:W}

        <div class="tile-bot">
          ${null!=s?j`<span class="tile-power">${Ce(s)}</span>`:W}
          <div class="tile-badges">
            ${$.map(e=>j`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
            ${n.label?j`<span class="type-badge type-${n.type}">${n.label}</span>`:W}
            ${e.isShelly?j`<span class="gen-badge gen-${n.gen}">${_}</span>`:W}
            ${e.isShelly&&e.ip&&this._isPrivateIp(e.ip)?j`
              <a href="http://${e.ip}" target="_blank" class="tile-ui-link"
                 @click=${e=>e.stopPropagation()} title="Open Shelly UI">↗</a>
            `:W}
          </div>
        </div>

        ${r?j`
          <div class="tile-trv-row" @click=${e=>e.stopPropagation()}>
            <div class="trv-temps">
              ${null!=r.currentTemp?j`<span class="trv-cur">${r.currentTemp}°</span><span class="trv-sep">›</span>`:W}
              <span class="trv-target ${v?"heating":""}">${r.targetTemp??"—"}°</span>
            </div>
            ${"heating"===r.hvacAction?j`<span class="trv-flame" title="Heating">🔥</span>`:W}
            <div class="trv-step-btns">
              <button class="trv-step" title="Decrease"
                @click=${()=>null!=r.targetTemp&&this._setTemp(r.entityId,r.targetTemp-r.step)}>−</button>
              <button class="trv-step" title="Increase"
                @click=${()=>null!=r.targetTemp&&this._setTemp(r.entityId,r.targetTemp+r.step)}>+</button>
            </div>
          </div>
          <div class="tile-dim-row tile-trv-slider" @click=${e=>e.stopPropagation()}>
            <input
              type="range"
              class="dim-slider"
              min=${r.minTemp} max=${r.maxTemp} step=${r.step}
              style="accent-color: var(--shelly-orange)"
              .value=${String(r.targetTemp??r.minTemp)}
              @input=${e=>{const t=e.target,s=t.closest(".tile-trv-slider")?.querySelector(".dim-pct");s&&(s.textContent=`${parseFloat(t.value).toFixed(1)}°`)}}
              @change=${e=>{this._setTemp(r.entityId,parseFloat(e.target.value))}}
            />
            <span class="dim-pct">${null!=r.targetTemp?r.targetTemp.toFixed(1):"—"}°</span>
          </div>
          ${null!=r.valvePosition?j`
            <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
              <div class="cov-bar">
                <div class="cov-fill" style="width: ${Math.min(100,r.valvePosition)}%"></div>
              </div>
              <span class="cov-pct">V: ${Math.round(r.valvePosition)}%</span>
            </div>
          `:W}
        `:W}

        ${i&&d?j`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            ${u?j`<span class="white-icon">RGB</span>`:W}
            ${h?j`
              <input
                type="color"
                class="color-swatch tile-color-swatch"
                .value=${g}
                ?disabled=${!i.isOn}
                title="Color"
                @input=${e=>{const t=e.target.value,s=e.target.closest(".tile-dim-row")?.querySelector(".dim-slider");s&&(s.style.accentColor=t)}}
                @change=${e=>{e.stopPropagation();const t=e.target.value;this._setColor(i.entityId,t,i.whiteValue,u)}}
              />
            `:W}
            <input
              type="range"
              class="dim-slider"
              min="1" max="100"
              style=${fe(h?{accentColor:g}:{})}
              .value=${String(i.isOn?Math.max(1,i.brightness??1):1)}
              ?disabled=${!i.isOn}
              @input=${e=>{const t=e.target,s=t.closest(".tile-dim-row")?.querySelector(".dim-pct");s&&(s.textContent=`${t.value}%`)}}
              @change=${e=>{this._setBrightness(i.entityId,parseInt(e.target.value,10))}}
            />
            <span class="dim-pct">${p}%</span>
          </div>
        `:W}

        ${i&&u?j`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            <span class="white-icon" title="White channel">W</span>
            <input
              type="range"
              class="dim-slider white-slider"
              min="0" max="100" step="1"
              .value=${String(Math.round((i.whiteValue??0)/Ue.BRIGHTNESS_MAX*100))}
              ?disabled=${!i.isOn}
              @input=${e=>{const t=e.target,s=t.closest(".tile-dim-row")?.querySelector(".dim-pct");s&&(s.textContent=`${t.value}%`)}}
              @change=${e=>{this._setWhite(i.entityId,parseInt(e.target.value,10),i.rgbColor)}}
            />
            <span class="dim-pct">${Math.round((i.whiteValue??0)/Ue.BRIGHTNESS_MAX*100)}%</span>
          </div>
        `:W}

        ${this._renderSparklines(e)}
        ${this._renderPowerBar(e)}
        ${l?this._renderExpanded(e):W}
      </div>
    `}_renderEntityList(e){return j`
      <div class="ent-list">
        ${e.entities.map(e=>{const t=this.hass.states[e.entity_id],s=t?.state??"unavailable",i=t?.attributes?.unit_of_measurement??"",r=t?.attributes?.friendly_name??e.entity_id.split(".")[1].replace(/_/g," "),o=i?`${s} ${i}`:s,a=Ue._DOMAIN_COLOR[e.domain]??"#7f8c8d",n="on"===s||"locked"===s||"open"===s,l=["switch","light","input_boolean","fan"].includes(e.domain),c="button"===e.domain||"input_button"===e.domain,d="lock"===e.domain;return j`
            <div class="ent-row">
              <span class="ent-domain" style="color:${a}">${e.domain}</span>
              <span class="ent-name">${r}</span>
              <span class="ent-state">${o}</span>
              ${l?j`
                <button class="tog sm ${"on"===s?"on":"off"}"
                  @click=${t=>this._toggle(e.entity_id,"on"===s,t)}>
                  ${"on"===s?"ON":"OFF"}
                </button>
              `:d?j`
                <button class="tog sm ${"locked"===s?"on":"off"}"
                  @click=${t=>{t.stopPropagation(),this.hass.callService("lock",n?"unlock":"lock",{entity_id:e.entity_id})}}>
                  ${"locked"===s?"LOCKED":"OPEN"}
                </button>
              `:c?j`
                <button class="tog sm off"
                  @click=${t=>{t.stopPropagation(),this.hass.callService("button","press",{entity_id:e.entity_id})}}>Press</button>
              `:W}
            </div>
          `})}
      </div>
    `}_renderExpanded(e){const t=this._getSwitches(e),s=this._getSensors(e),i=this._getFirmware(e),r=this._getTrv(e),o=this._getCover(e),a=this._getValve(e),n="input"===Ae(e).type?this._getInputChannels(e):[];e.ip;t.some(e=>void 0!==e.brightness);return t.length,j`
      <div class="expanded" @click=${e=>e.stopPropagation()}>

        ${o?j`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Roller / Cover</div>
            <!-- Open / Stop / Close buttons -->
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===o.state?"on":"off"}"
                @click=${e=>this._coverAction(o.entityId,"open",e)}>Open</button>
              <button class="tog sm off"
                @click=${e=>this._coverAction(o.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===o.state?"on":"off"}"
                @click=${e=>this._coverAction(o.entityId,"close",e)}>Close</button>
            </div>
            ${null!=o.position?j`
              <!-- Position slider -->
              <div class="dim-wrap" style="margin-top: 8px;">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="5"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(o.position)}
                  @input=${e=>{const t=e.target,s=t.closest(".exp-section--cover")?.querySelector(".cov-pos-disp");s&&(s.textContent=`${t.value}%`)}}
                  @change=${e=>{e.stopPropagation(),this._setCoverPosition(o.entityId,parseFloat(e.target.value))}}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top: 2px;">
                Position: <span class="cov-pos-disp">${Math.round(o.position)}%</span>
              </div>
            `:W}
          </div>
        `:W}

        ${a?j`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Water Valve</div>
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===a.state?"on":"off"}"
                @click=${e=>this._valveAction(a.entityId,"open",e)}>Open</button>
              <button class="tog sm off"
                @click=${e=>this._valveAction(a.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===a.state?"on":"off"}"
                @click=${e=>this._valveAction(a.entityId,"close",e)}>Close</button>
            </div>
            ${null!=a.position?j`
              <div class="dim-wrap" style="margin-top: 8px;">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider"
                  min="0" max="100" step="1"
                  style="accent-color: var(--shelly-orange)"
                  .value=${String(a.position)}
                  @input=${e=>{const t=e.target,s=t.closest(".exp-section--cover")?.querySelector(".cov-pos-disp");s&&(s.textContent=`${t.value}%`)}}
                  @change=${e=>{e.stopPropagation(),this._setValvePosition(a.entityId,parseFloat(e.target.value))}}
                />
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center; font-size:12px; color: var(--sc-text-secondary); margin-top: 2px;">
                Position: <span class="cov-pos-disp">${Math.round(a.position)}%</span>
              </div>
            `:W}
            ${null!=a.temperature?j`
              <div class="trv-valve-row" style="margin-top: 8px;">
                <span class="sensor-label">Temperature</span>
                <span class="sensor-value">${a.temperature.toFixed(1)} °C</span>
              </div>
            `:W}
          </div>
        `:W}

        ${r?j`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>

            <!-- Temperature display + ± buttons -->
            <div class="trv-ctrl-row">
              <button class="trv-big-btn"
                @click=${e=>{e.stopPropagation(),null!=r.targetTemp&&this._setTemp(r.entityId,Math.max(r.minTemp,r.targetTemp-r.step))}}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${null!=r.targetTemp?r.targetTemp.toFixed(1):"—"}°</span>
                ${null!=r.currentTemp?j`<span class="trv-current-sub">now ${r.currentTemp}°</span>`:W}
                ${"heating"===r.hvacAction?j`<span class="trv-action-badge heating">Heating</span>`:"idle"===r.hvacAction?j`<span class="trv-action-badge idle">Idle</span>`:W}
              </div>
              <button class="trv-big-btn"
                @click=${e=>{e.stopPropagation(),null!=r.targetTemp&&this._setTemp(r.entityId,Math.min(r.maxTemp,r.targetTemp+r.step))}}>+</button>
            </div>

            <!-- Temperature slider -->
            <div class="dim-wrap" style="margin: 4px 0 8px;">
              <span class="trv-range-lbl">${r.minTemp}°</span>
              <input type="range" class="dim-slider"
                min=${r.minTemp} max=${r.maxTemp} step=${r.step}
                style="accent-color: var(--shelly-orange)"
                .value=${String(r.targetTemp??r.minTemp)}
                @input=${e=>{const t=e.target,s=t.closest(".exp-section--trv")?.querySelector(".trv-target-big");s&&(s.textContent=`${parseFloat(t.value).toFixed(1)}°`)}}
                @change=${e=>{e.stopPropagation(),this._setTemp(r.entityId,parseFloat(e.target.value))}}
              />
              <span class="trv-range-lbl">${r.maxTemp}°</span>
            </div>

            <!-- Mode buttons -->
            <div class="trv-mode-row">
              <button class="tog sm ${"heat"===r.hvacMode?"on":"off"}"
                @click=${e=>this._setHvacMode(r.entityId,"heat",e)}>Heat</button>
              <button class="tog sm ${"off"===r.hvacMode?"on":"off"}"
                @click=${e=>this._setHvacMode(r.entityId,"off",e)}>Off</button>
            </div>

            <!-- Presets -->
            ${r.presetModes.length?j`
              <div class="trv-preset-row">
                ${r.presetModes.map(e=>j`
                  <button class="tog sm ${r.presetMode===e?"on":"off"} trv-preset"
                    @click=${t=>this._setPresetMode(r.entityId,e,t)}>${e}</button>
                `)}
              </div>
            `:W}

            <!-- Valve position bar -->
            ${null!=r.valvePosition?j`
              <div class="trv-valve-row">
                <span class="sensor-label">Valve</span>
                <div class="trv-valve-bar">
                  <div class="trv-valve-fill" style="width: ${Math.min(100,r.valvePosition)}%"></div>
                </div>
                <span class="sensor-value">${Math.round(r.valvePosition)}%</span>
              </div>
            `:W}
          </div>
        `:W}

        ${n.length?j`
          <div class="exp-section">
            <div class="exp-label">Inputs</div>
            <div class="input-grid">
              ${n.map(e=>j`
                <div class="input-row">
                  <span class="input-row-dot ${e.isOn?"active":""}"></span>
                  <span class="input-row-name">${e.fullName}</span>
                  <span class="input-row-state ${e.isOn?"active":""}">${e.isOn?"ON":"OFF"}</span>
                </div>
              `)}
            </div>
          </div>
        `:W}

        ${s.length?j`
          <div class="exp-section">
            <div class="exp-label">Sensors</div>
            <div class="sensor-row">
              ${s.map(e=>j`
                <div class="sensor-chip">
                  <span class="sensor-label">${e.label}</span>
                  <span class="sensor-value ${e.warn?"warn":""}">${e.value}</span>
                </div>
              `)}
            </div>
          </div>
        `:W}

        ${i?j`
          <div class="exp-section">
            <div class="exp-label">Firmware update available</div>
            <div class="exp-row">
              <span class="exp-name">${i.newVersion??"New version"}</span>
              <button
                class="tog sm update"
                @click=${e=>this._installUpdate(i.entityId,e)}
              >Install</button>
            </div>
          </div>
        `:W}

        ${(()=>{const t=this._entityListOpen.has(e.device_id);return j`
            <div class="exp-section exp-section--full">
              <div class="ent-list-header" @click=${s=>{s.stopPropagation();const i=new Set(this._entityListOpen);t?i.delete(e.device_id):i.add(e.device_id),this._entityListOpen=i}}>
                <span class="exp-label" style="margin:0">All Entities (${e.entities.length})</span>
                <span class="ent-caret ${t?"open":""}">▼</span>
              </div>
              ${t?this._renderEntityList(e):W}
            </div>
          `})()}

      </div>
    `}_renderSearchBar(){return j`
      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            class="search-input"
            placeholder="Search devices…"
            .value=${this._searchTerm}
            @input=${e=>{this._searchTerm=e.target.value}}
          />
          ${this._searchTerm?j`
            <button class="search-clear" @click=${()=>{this._searchTerm=""}}>✕</button>
          `:W}
        </div>
        <div class="sort-pills">
          ${["name","power","online"].map(e=>j`
            <button class="sort-pill ${this._sortBy===e?"active":""}"
              title="Sort by ${e}"
              @click=${()=>{this._sortBy=e}}>
              ${"name"===e?"A→Z":"power"===e?"⚡":"●"}
            </button>
          `)}
        </div>
        <div class="view-pills">
          <button class="view-pill ${"grid"===this._viewMode?"active":""}"
            @click=${()=>{this._viewMode="grid"}} title="Grid view">⊞</button>
          <button class="view-pill ${"list"===this._viewMode?"active":""}"
            @click=${()=>{this._viewMode="list"}} title="List view">≡</button>
        </div>
        <button class="bulk-toggle-btn ${this._bulkMode?"active":""}"
          @click=${()=>{this._bulkMode=!this._bulkMode,this._bulkMode||(this._selectedDevices=new Set)}} title="Bulk select">☑</button>
        <button class="glow-toggle-btn ${this._glowEnabled?"active":""}"
          @click=${()=>{this._glowEnabled=!this._glowEnabled}}
          title="${this._glowEnabled?"Glow: ON — click to turn off":"Glow: OFF — click to turn on"}">✦</button>
      </div>
    `}_renderBulkActions(){return j`
      <div class="bulk-bar">
        <span class="bulk-count">${this._selectedDevices.size} selected</span>
        <button class="tog sm on" @click=${()=>this._bulkToggle(!0)}>All ON</button>
        <button class="tog sm off" @click=${()=>this._bulkToggle(!1)}>All OFF</button>
        <button class="tog sm off" style="margin-left:auto"
          @click=${()=>{this._selectedDevices=new Set}}>Clear</button>
      </div>
    `}_renderPowerBar(e){if(!this._config.show_power_bar)return j``;const t=this._getPower(e)??0,s=this._config.power_bar_max??2e3,i=Math.min(100,t/s*100);return j`
      <div class="power-bar" title="${t.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${i}%"></div>
      </div>
    `}_renderListRow(e){const t=this._isOnline(e),s=this._getPower(e),i=this._getPrimarySwitch(e),r=this._getTrv(e),o=this._getValve(e),a=Ae(e),n=this._getAlerts(e),l=this._expandedDevice===e.device_id,c=this._selectedDevices.has(e.device_id),d=this._config.tile_size??"md";return j`
      <div
        class="list-row ${t?"":"offline"} ${c?"selected":""} row-${d}"
        @click=${t=>this._clickTile(e,t)}
      >
        ${this._bulkMode?j`
          <input type="checkbox" class="bulk-check"
            .checked=${c}
            @click=${t=>{t.stopPropagation(),this._toggleBulkSelect(e.device_id)}}
          />
        `:W}
        <span class="dot ${t?"online":"offline"}"></span>
        <span class="list-name">${e.name}</span>
        <div class="list-center">
          ${a.label?j`<span class="type-badge type-${a.type}">${a.label}</span>`:W}
          ${n.map(e=>j`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
        </div>
        ${null!=s?j`<span class="list-power">${Ce(s)}</span>`:W}
        <div class="list-ctrl" @click=${e=>e.stopPropagation()}>
          ${i?j`
            <button class="tog sm ${i.isOn?"on":"off"}"
              @click=${e=>this._toggle(i.entityId,i.isOn,e)}>
              ${i.isOn?"ON":"OFF"}
            </button>
          `:r?j`
            <span class="list-temp">${r.currentTemp??"—"}°→${r.targetTemp??"—"}°</span>
          `:o?j`
            <button class="tog sm ${"open"===o.state?"on":"off"}"
              @click=${e=>this._valveAction(o.entityId,"open"===o.state?"close":"open",e)}>
              ${"open"===o.state?"OPEN":"closed"===o.state?"CLOSED":o.state.toUpperCase()}
            </button>
          `:W}
        </div>
        <button class="list-expand ${l?"active":""}"
          @click=${t=>this._expandTile(e.device_id,t)} title="Details">›</button>
      </div>
      ${l?j`
        <div class="list-detail" @click=${e=>e.stopPropagation()}>
          ${this._renderExpanded(e)}
        </div>
      `:W}
    `}};var je,Ge;Le.BRIGHTNESS_MAX=255,Le.GRAPH_DC_LABELS={temperature:"Temp",humidity:"Hum",power:"Power",energy:"Energy",voltage:"Volt",current:"Curr",illuminance:"Light",carbon_dioxide:"CO₂",battery:"Batt",apparent_power:"App.P",reactive_power:"Re.P",frequency:"Freq",power_factor:"PF",gas:"Gas"},Le._DOMAIN_COLOR={switch:"var(--shelly-orange)",light:"#f0c040",sensor:"#5b8dd9",binary_sensor:"#4ecdc4",button:"#9b59b6",input_button:"#9b59b6",cover:"#e67e22",climate:"#e74c3c",update:"#2ecc71",number:"#7f8c8d",select:"#7f8c8d",input_boolean:"var(--shelly-orange)",input_number:"#7f8c8d",input_select:"#7f8c8d",input_text:"#7f8c8d",lock:"#e74c3c",fan:"#5b8dd9",media_player:"#1abc9c",text:"#7f8c8d",event:"#7f8c8d"},Le.styles=a`
    /* ── All overridable tokens (card-mod targets :host) ──────────────────
     *
     * Dark theme defaults are set here. Override any via card-mod:
     *   card_mod:
     *     style: |
     *       :host {
     *         --sc-header-bg: linear-gradient(135deg, #1e3a5f, #1e40af);
     *         --sc-tile-bg: rgba(0,0,0,.04);
     *         --sc-text-primary: #111827;
     *       }
     * ─────────────────────────────────────────────────────────────────── */
    :host {
      /* Brand */
      --shelly-orange: #f4601e;
      --shelly-glow:   rgba(244, 96, 30, 0.35);
      --tile-radius:   12px;

      /* Header */
      --sc-header-bg:      linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      --sc-header-orb2:    #3b82f6;
      --sc-header-text:    #ffffff;

      /* Status indicators */
      --sc-online-color:   #4ade80;
      --sc-online-bg:      rgba(74, 222, 128, 0.2);
      --sc-online-border:  rgba(74, 222, 128, 0.3);
      --sc-online-glow:    rgba(74, 222, 128, 0.4);
      --sc-power-color:    #fb923c;
      --sc-offline-dot:    #4b5563;

      /* Tile surfaces */
      --sc-tile-bg:            rgba(255, 255, 255, 0.04);
      --sc-tile-border:        rgba(255, 255, 255, 0.07);
      --sc-tile-hover-bg:      rgba(255, 255, 255, 0.07);
      --sc-tile-hover-shadow:  rgba(0, 0, 0, 0.30);
      --sc-tile-expanded-bg:   rgba(255, 255, 255, 0.06);
      --sc-area-hover-bg:      rgba(255, 255, 255, 0.03);
      --sc-sensor-bg:          rgba(255, 255, 255, 0.04);

      /* Text */
      --sc-text-primary:   #e5e7eb;
      --sc-text-secondary: #9ca3af;
      --sc-text-muted:     #6b7280;
      --sc-text-value:     #f9fafb;
      --sc-text-detail:    #d1d5db;

      /* Toggle OFF state */
      --sc-tog-off-bg:     rgba(255, 255, 255, 0.08);
      --sc-tog-off-border: rgba(255, 255, 255, 0.10);

      /* Firmware update accent */
      --sc-update-color:   #f59e0b;
      --sc-update-glow:    rgba(245, 158, 11, 0.40);
    }

    ha-card {
      overflow: hidden;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      container-type: inline-size;
      container-name: shelly-card;
    }

    /* ── Animated header background ─────────────────────────────────────── */
    .dash-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 14px;
      background: var(--sc-header-bg);
      overflow: hidden;
    }

    .dash-header::before,
    .dash-header::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.5;
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before {
      width: 120px; height: 120px;
      background: var(--shelly-orange);
      top: -40px; left: -20px;
    }
    .dash-header::after {
      width: 100px; height: 100px;
      background: var(--sc-header-orb2);
      bottom: -30px; right: 20px;
      animation-delay: -4s;
    }

    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(15px, 8px) scale(1.15); }
    }

    .dash-title {
      font-size: 1.15em;
      font-weight: 800;
      color: var(--sc-header-text);
      letter-spacing: 0.02em;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dash-title::before { content: '⚡'; font-size: 1em; }

    .dash-stats {
      display: flex;
      gap: 8px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .stat {
      font-size: 0.8em;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .stat.online {
      background: var(--sc-online-bg);
      color: var(--sc-online-color);
      border: 1px solid var(--sc-online-border);
    }
    .stat.power {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--sc-power-color);
      border: 1px solid color-mix(in srgb, var(--shelly-orange) 30%, transparent);
    }

    /* ── Body ───────────────────────────────────────────────────────────── */
    .dash-body { padding: 0 0 8px; }

    .empty {
      padding: 32px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .empty .hint { font-size: 0.85em; margin-top: 4px; }

    /* ── Area sections ──────────────────────────────────────────────────── */
    .area-section {
      position: relative;
      overflow: hidden;
      margin: 6px 10px 2px;
      border: 1px solid var(--sc-tile-border);
      border-radius: 10px;
    }

    .area-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--area-header-bg, rgba(255,255,255,0.04));
      padding: 8px 14px;
      cursor: pointer;
      user-select: none;
      border-radius: 10px;
      transition: background 0.15s, filter 0.15s;
    }
    .area-header:hover { filter: brightness(1.08); }
    .area-section:not(.closed) .area-header {
      border-radius: 10px 10px 0 0;
      border-bottom: 1px solid var(--sc-tile-border);
    }

    .area-name {
      font-size: var(--area-name-size, 0.78em);
      font-weight: var(--area-name-weight, 700);
      font-style: var(--area-name-style, normal);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--area-header-color, var(--shelly-orange));
    }

    .area-meta { display: flex; align-items: center; gap: 8px; }
    .area-count { font-size: 0.75em; color: var(--secondary-text-color); }
    .area-power { font-size: 0.78em; font-weight: 600; color: var(--sc-power-color); }

    .chevron {
      font-size: 0.6em;
      color: var(--secondary-text-color);
      transition: transform 0.25s ease;
      display: inline-block;
    }
    .chevron.open { transform: rotate(180deg); }

    /* ── Device grid ────────────────────────────────────────────────────── */
    .device-grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 3), 1fr);
      gap: 10px;
      padding: 4px 12px 14px;
    }
    @container shelly-card (max-width: 600px) { .device-grid { --cols: 2; } }
    @container shelly-card (max-width: 380px) { .device-grid { --cols: 1; } }

    /* ── Device tile ────────────────────────────────────────────────────── */
    .tile {
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: var(--tile-radius);
      padding: 11px 13px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }

    .tile::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--shelly-orange), transparent);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--sc-tile-hover-shadow);
      background: var(--sc-tile-hover-bg);
    }
    .tile:hover::before { opacity: 1; }

    .tile.offline { opacity: 0.45; filter: grayscale(0.4); }

    .tile.expanded {
      grid-column: 1 / -1;
      background: var(--sc-tile-expanded-bg);
      border-color: var(--shelly-orange);
      box-shadow: 0 0 0 1px var(--shelly-orange), 0 8px 24px var(--shelly-glow);
      transform: none;
    }
    .tile.expanded::before { opacity: 1; }

    .tile.glow-on { box-shadow: 0 0 12px var(--shelly-glow); }

    /* Full-width brightness row below tile-bot for dimmable devices */
    .tile-dim-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 0;
    }

    .tile-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      min-width: 0;
    }

    .tile-left {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot.online {
      background: var(--sc-online-color);
      box-shadow: 0 0 0 0 var(--sc-online-glow);
      animation: pulse-dot 2.5s ease-in-out infinite;
    }
    .dot.offline { background: var(--sc-offline-dot); }

    @keyframes pulse-dot {
      0%   { box-shadow: 0 0 0 0 var(--sc-online-glow); }
      60%  { box-shadow: 0 0 0 5px transparent; }
      100% { box-shadow: 0 0 0 0 var(--sc-online-glow); }
    }

    .tile-name {
      font-size: 0.88em;
      font-weight: 600;
      color: var(--sc-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .update-dot {
      color: var(--sc-update-color);
      font-size: 0.55em;
      flex-shrink: 0;
      animation: blink 2s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0.3; } }

    .tile-bot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      min-width: 0;
    }

    .tile-power {
      font-size: 0.95em;
      font-weight: 700;
      color: var(--sc-power-color);
      font-variant-numeric: tabular-nums;
    }

    .tile-model {
      font-size: 0.68em;
      color: var(--sc-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }

    /* ── Toggle button ──────────────────────────────────────────────────── */
    .tog {
      padding: 4px 11px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.72em;
      font-weight: 700;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      transition: transform 0.1s, opacity 0.15s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
    }
    .tog::after {
      content: '';
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .tog:active::after { opacity: 0.15; }
    .tog.sm { padding: 2px 9px; font-size: 0.68em; }

    .tog.on {
      background: linear-gradient(135deg, var(--shelly-orange), color-mix(in srgb, var(--shelly-orange) 70%, #f97316));
      color: white;
      box-shadow: 0 2px 8px var(--shelly-glow);
    }
    .tog.off {
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-secondary);
      border: 1px solid var(--sc-tog-off-border);
    }
    .tog.update {
      background: linear-gradient(135deg, var(--sc-update-color), color-mix(in srgb, var(--sc-update-color) 60%, #f97316));
      color: white;
      box-shadow: 0 2px 6px var(--sc-update-glow);
    }
    .tog:hover { opacity: 0.85; transform: scale(1.04); }
    .tog:active { transform: scale(0.96); }

    /* ── Expanded detail ────────────────────────────────────────────────── */
    .expanded {
      margin-top: 10px;
      border-top: 1px solid color-mix(in srgb, var(--shelly-orange) 25%, transparent);
      padding-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
      animation: slide-in 0.2s ease;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .exp-section { flex: 1; min-width: 140px; }
    .exp-section--full { flex: 1 1 100%; min-width: 0; }

    /* ── All Entities list ──────────────────────────────────────────── */
    .ent-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      padding: 4px 0;
    }
    .ent-list-header:hover .exp-label { color: var(--sc-text-detail); }

    .ent-caret {
      font-size: 0.65em;
      color: var(--sc-text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .ent-caret.open { transform: rotate(180deg); }

    .ent-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 6px;
    }

    .ent-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 6px;
      background: var(--sc-tile-bg);
      min-height: 28px;
    }

    .ent-domain {
      font-size: 0.62em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      min-width: 72px;
      flex-shrink: 0;
      opacity: 0.9;
    }

    .ent-name {
      font-size: 0.82em;
      color: var(--sc-text-detail);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ent-state {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-family: monospace;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .exp-label {
      font-size: 0.68em;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--sc-text-muted);
      margin-bottom: 7px;
      font-weight: 600;
    }

    .exp-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 3px 0;
    }

    .exp-name {
      font-size: 0.84em;
      color: var(--sc-text-detail);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex-shrink: 0;
      max-width: 40%;
    }

    /* ── Dimmer horizontal slider ────────────────────────────────────── */
    /* Used both in .tile-dim-row (tile face) and .dim-wrap (expanded view) */
    .dim-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .dim-slider {
      flex: 1;
      min-width: 0;
      cursor: pointer;
      accent-color: var(--shelly-orange);
      background: transparent;
      padding: 0;
    }
    .dim-slider:disabled { opacity: 0.3; cursor: default; }
    .white-slider { accent-color: #e8e8e8; }
    .white-icon {
      font-size: 0.65em;
      font-weight: 700;
      color: var(--sc-text-secondary);
      min-width: 12px;
      flex-shrink: 0;
      letter-spacing: -0.02em;
    }

    .dim-pct {
      font-size: 0.68em;
      font-weight: 600;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 30px;
      flex-shrink: 0;
    }

    /* ── Channels: left-to-right card layout ────────────────────────── */
    .exp-section--channels { flex-basis: 100%; }

    .channels-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }

    .channel-card {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 8px 10px;
      background: var(--sc-sensor-bg);
      border-radius: 10px;
      min-width: 130px;
      flex: 1;
    }

    .channel-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .channel-name {
      font-size: 0.84em;
      font-weight: 600;
      color: var(--sc-text-detail);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
    }

    .channel-color-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .channel-color-label {
      font-size: 0.7em;
      color: var(--sc-text-muted);
      flex-shrink: 0;
    }

    /* ── Color picker swatch ─────────────────────────────────────────── */
    .color-swatch {
      width: 34px;
      height: 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 1px;
      background: transparent;
      flex-shrink: 0;
    }
    .color-swatch:disabled { opacity: 0.3; cursor: default; }

    /* Tile-face swatch — taller to align with the range slider thumb */
    .tile-color-swatch {
      width: 30px;
      height: 20px;
      border-radius: 5px;
    }

    .sensor-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .sensor-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--sc-sensor-bg);
      border-radius: 20px;
      padding: 4px 10px;
      white-space: nowrap;
    }

    .sensor-label {
      font-size: 0.65em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sc-text-muted);
    }

    .sensor-value {
      font-size: 0.85em;
      font-weight: 600;
      color: var(--sc-text-value);
      font-variant-numeric: tabular-nums;
    }
    .sensor-value.warn { color: var(--error-color, #ef4444); }

    .exp-actions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      flex: 1;
      min-width: 100px;
      padding-top: 4px;
    }

    .exp-link {
      font-size: 0.8em;
      color: var(--shelly-orange);
      text-decoration: none;
      padding: 4px 10px;
      border: 1px solid color-mix(in srgb, var(--shelly-orange) 30%, transparent);
      border-radius: 6px;
      transition: background 0.15s;
    }
    .exp-link:hover {
      background: color-mix(in srgb, var(--shelly-orange) 10%, transparent);
      text-decoration: none;
    }

    /* ── TRV (Thermostatic Radiator Valve) ──────────────────────────── */

    /* Tile face — compact row */
    .tile-trv-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 0;
    }

    .trv-temps {
      display: flex;
      align-items: baseline;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .trv-cur {
      font-size: 0.82em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .trv-sep {
      font-size: 0.7em;
      color: var(--sc-text-muted);
    }

    .trv-target {
      font-size: 0.95em;
      font-weight: 700;
      color: var(--sc-text-value);
      font-variant-numeric: tabular-nums;
    }
    .trv-target.heating { color: var(--shelly-orange); }

    .trv-flame { font-size: 0.75em; flex-shrink: 0; }

    .trv-valve-pct {
      font-size: 0.7em;
      color: var(--sc-text-muted);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .trv-step-btns {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
    }

    .trv-step {
      width: 22px;
      height: 22px;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-secondary);
      font-size: 1em;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }
    .trv-step:hover { background: var(--shelly-orange); color: white; border-color: var(--shelly-orange); }
    .trv-step:active { transform: scale(0.92); }

    /* Expanded section */
    .exp-section--trv { flex-basis: 100%; min-width: unset; }

    .trv-ctrl-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .trv-big-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 50%;
      background: var(--sc-tog-off-bg);
      color: var(--sc-text-primary);
      font-size: 1.3em;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
    }
    .trv-big-btn:hover { background: var(--shelly-orange); color: white; border-color: var(--shelly-orange); }
    .trv-big-btn:active { transform: scale(0.92); }

    .trv-display {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .trv-target-big {
      font-size: 1.8em;
      font-weight: 700;
      color: var(--sc-text-primary);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .trv-current-sub {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .trv-action-badge {
      font-size: 0.65em;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 10px;
    }
    .trv-action-badge.heating { background: color-mix(in srgb, var(--shelly-orange) 20%, transparent); color: var(--shelly-orange); }
    .trv-action-badge.idle    { background: var(--sc-sensor-bg); color: var(--sc-text-muted); }

    .trv-range-lbl {
      font-size: 0.68em;
      color: var(--sc-text-muted);
      flex-shrink: 0;
    }

    .trv-mode-row {
      display: flex;
      gap: 6px;
      margin-bottom: 6px;
    }

    .tile-valve-body {
      padding: 4px 0 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tile-valve-body .trv-mode-row {
      gap: 4px;
      margin-bottom: 0;
    }

    .tile-valve-ename {
      font-size: 11px;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tile-valve-temp {
      font-size: 13px;
      font-weight: 500;
      color: var(--sc-text-primary);
    }

    .trv-preset-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 6px;
    }

    .trv-preset { text-transform: capitalize; }

    .trv-valve-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .trv-valve-bar {
      flex: 1;
      height: 6px;
      background: var(--sc-sensor-bg);
      border-radius: 3px;
      overflow: hidden;
    }

    .trv-valve-fill {
      height: 100%;
      background: var(--shelly-orange);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    /* ── Cover / Roller controls ────────────────────────────────────────── */
    .cov-btns {
      display: flex;
      gap: 2px;
    }
    .cov-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-primary);
      cursor: pointer;
      font-size: 10px;
      padding: 3px 7px;
      line-height: 1;
      transition: background 0.15s;
    }
    .cov-btn:hover { background: rgba(255,255,255,.15); }
    .cov-btn.stop  { color: var(--sc-text-muted); }

    .cov-pos-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0 2px;
    }
    .cov-bar {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,.10);
      border-radius: 3px;
      overflow: hidden;
    }
    .cov-fill {
      height: 100%;
      background: var(--shelly-orange);
      border-radius: 3px;
      transition: width 0.4s ease;
    }
    .cov-fill.moving {
      animation: pulse-bar 0.8s ease-in-out infinite alternate;
    }
    @keyframes pulse-bar {
      from { opacity: 1; }
      to   { opacity: 0.5; }
    }
    .cov-pct {
      font-size: 10px;
      color: var(--sc-text-secondary);
      min-width: 34px;
      text-align: right;
    }

    /* ── Device type + gen badges ───────────────────────────────────────── */
    .tile-badges {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-left: auto;
    }
    .type-badge,
    .gen-badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 2px 5px;
      border-radius: 4px;
      line-height: 1.4;
      white-space: nowrap;
    }

    /* Shelly UI quick-link on tile face */
    .tile-ui-link {
      font-size: 11px;
      font-weight: 700;
      color: var(--shelly-orange);
      text-decoration: none;
      padding: 1px 4px;
      border-radius: 4px;
      opacity: 0.75;
      transition: opacity 0.15s, background 0.15s;
      line-height: 1.4;
    }
    .tile-ui-link:hover {
      opacity: 1;
      background: rgba(244, 96, 30, 0.15);
    }

    /* Type badge colours */
    .type-relay        { background: rgba(99,102,241,.25);  color: #a5b4fc; }
    .type-dimmer       { background: rgba(234,179,8,.20);   color: #fde047; }
    .type-rgb          { background: rgba(236,72,153,.22);  color: #f9a8d4; }
    .type-plug         { background: rgba(34,197,94,.20);   color: #86efac; }
    .type-cover        { background: rgba(14,165,233,.20);  color: #7dd3fc; }
    .type-energy       { background: rgba(245,158,11,.22);  color: #fcd34d; }
    .type-sensor       { background: rgba(20,184,166,.20);  color: #5eead4; }
    .type-input        { background: rgba(168,85,247,.20);  color: #d8b4fe; }
    .type-trv          { background: rgba(239,68,68,.22);   color: #fca5a5; }

    /* ── Input channels (i3 / i4) ───────────────────────────────────────── */
    .tile-inputs {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      padding: 4px 0 2px;
    }
    .input-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px 4px 8px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
      font-size: 12px;
      color: var(--sc-text-muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .input-chip.active {
      background: rgba(255,106,0,0.20);
      color: var(--shelly-orange);
      border-color: rgba(255,106,0,0.40);
    }
    .input-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .input-lbl { font-weight: 600; }

    /* Expanded inputs section */
    .input-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .input-row-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--sc-text-muted);
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .input-row-dot.active { background: var(--shelly-orange); }
    .input-row-name {
      flex: 1;
      font-size: 13px;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .input-row-state {
      font-size: 11px;
      font-weight: 600;
      color: var(--sc-text-muted);
      letter-spacing: 0.04em;
    }
    .input-row-state.active { color: var(--shelly-orange); }
    .type-wall_display { background: rgba(99,102,241,.25);  color: #c4b5fd; }
    .type-uni          { background: rgba(156,163,175,.20); color: #d1d5db; }
    .type-unknown      { display: none; }

    /* Gen badge colours */
    .gen-1   { background: rgba(107,114,128,.25); color: #9ca3af; }
    .gen-2   { background: rgba(59,130,246,.22);  color: #93c5fd; }
    .gen-3   { background: rgba(34,197,94,.20);   color: #86efac; }
    .gen-4   { background: rgba(168,85,247,.20);  color: #d8b4fe; }
    .gen-ble { background: rgba(6,182,212,.20);   color: #67e8f9; }

    /* ── Enhanced on-state glow animation ───────────────────────────────── */
    .tile.glow-on {
      animation: pulse-glow 3s ease-in-out infinite;
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 8px var(--shelly-glow); }
      50%       { box-shadow: 0 0 20px var(--shelly-glow), 0 0 32px var(--shelly-glow); }
    }
    /* expanded tiles don't pulse — they have their own ring */
    .tile.expanded.glow-on { animation: none; box-shadow: 0 0 0 1px var(--shelly-orange), 0 8px 24px var(--shelly-glow); }

    /* ── Tile sizes ──────────────────────────────────────────────────────── */
    .tile.tile-sm { padding: 7px 9px; gap: 4px; }
    .tile.tile-sm .tile-name  { font-size: 0.78em; }
    .tile.tile-sm .tile-power { font-size: 0.82em; }
    .tile.tile-lg { padding: 15px 17px; gap: 9px; }
    .tile.tile-lg .tile-name  { font-size: 1em; }
    .tile.tile-lg .tile-power { font-size: 1.1em; }

    /* ── Bulk select ─────────────────────────────────────────────────────── */
    .bulk-check {
      width: 15px;
      height: 15px;
      accent-color: var(--shelly-orange);
      cursor: pointer;
      flex-shrink: 0;
    }
    .tile.selected {
      border-color: var(--shelly-orange) !important;
      background: color-mix(in srgb, var(--shelly-orange) 8%, var(--sc-tile-bg));
    }
    .list-row.selected {
      border-color: var(--shelly-orange);
      background: color-mix(in srgb, var(--shelly-orange) 8%, var(--sc-tile-bg));
    }

    /* ── Alert badges ────────────────────────────────────────────────────── */
    .alert-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      white-space: nowrap;
      animation: blink 1.5s step-end infinite;
    }
    .alert-overtemp { background: rgba(251,146,60,.25); color: #fdba74; }
    .alert-overpower { background: rgba(239,68,68,.25); color: #fca5a5; }

    /* ── Mini power bar ──────────────────────────────────────────────────── */
    .power-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: rgba(255,255,255,.06);
      border-radius: 0 0 var(--tile-radius) var(--tile-radius);
      overflow: hidden;
    }
    .power-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--shelly-orange), #f97316);
      border-radius: inherit;
      transition: width 0.4s ease;
    }

    /* ── Sparkline graphs ────────────────────────────────────────────────── */
    .sparklines-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 8px 2px;
    }
    .spark-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
    }
    .spark-lbl {
      font-size: 0.62em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sc-text-muted);
      width: 34px;
      flex-shrink: 0;
      text-align: right;
    }
    .sparkline-svg {
      flex: 1;
      height: 32px;
      display: block;
    }
    .spark-val {
      font-size: 0.75em;
      font-weight: 600;
      color: var(--sc-text-secondary);
      white-space: nowrap;
      min-width: 44px;
      text-align: right;
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .sparkline-loading {
      flex: 1;
      height: 32px;
      border-radius: 4px;
      background: linear-gradient(90deg,
        rgba(255,255,255,.03) 0%,
        rgba(255,255,255,.08) 50%,
        rgba(255,255,255,.03) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
    }

    /* ── Expand button (tile_click=toggle mode) ──────────────────────────── */
    .tile-expand-btn {
      background: transparent;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 5px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.8em;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.15s;
      line-height: 1;
    }
    .tile-expand-btn:hover { color: var(--shelly-orange); border-color: var(--shelly-orange); }
    .tile-expand-btn.active { color: var(--shelly-orange); border-color: var(--shelly-orange); }

    /* ── Search bar ──────────────────────────────────────────────────────── */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 6px;
      border-bottom: 1px solid var(--sc-tile-border);
    }
    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: 8px;
      padding: 4px 8px;
      min-width: 0;
    }
    .search-icon { font-size: 0.75em; flex-shrink: 0; }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--sc-text-primary);
      font-size: 0.82em;
      min-width: 0;
    }
    .search-input::placeholder { color: var(--sc-text-muted); }
    .search-input::-webkit-search-cancel-button { display: none; }
    .search-clear {
      background: transparent;
      border: none;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.72em;
      padding: 0 2px;
      line-height: 1;
      flex-shrink: 0;
    }
    .sort-pills, .view-pills {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }
    .sort-pill, .view-pill {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.7em;
      font-weight: 700;
      padding: 3px 7px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .sort-pill.active, .view-pill.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }
    .sort-pill:hover, .view-pill:hover { opacity: 0.8; }
    .bulk-toggle-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.85em;
      padding: 3px 7px;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .bulk-toggle-btn.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }
    .glow-toggle-btn {
      background: var(--sc-tog-off-bg);
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 6px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 0.8em;
      padding: 3px 7px;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .glow-toggle-btn.active {
      background: color-mix(in srgb, var(--shelly-orange) 20%, transparent);
      color: var(--shelly-orange);
      border-color: color-mix(in srgb, var(--shelly-orange) 40%, transparent);
    }

    /* ── Bulk actions bar ────────────────────────────────────────────────── */
    .bulk-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: color-mix(in srgb, var(--shelly-orange) 10%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--shelly-orange) 25%, transparent);
    }
    .bulk-count {
      font-size: 0.78em;
      color: var(--shelly-orange);
      font-weight: 700;
      flex: 1;
    }

    /* ── Header stat variants ────────────────────────────────────────────── */
    .stat.offline-count {
      background: rgba(75,85,99,.25);
      color: #9ca3af;
      border: 1px solid rgba(75,85,99,.35);
    }
    .stat.alerts-count {
      background: rgba(239,68,68,.2);
      color: #fca5a5;
      border: 1px solid rgba(239,68,68,.3);
      animation: blink 2s step-end infinite;
    }

    /* ── List view ───────────────────────────────────────────────────────── */
    .device-list {
      display: flex;
      flex-direction: column;
      padding: 4px 12px 8px;
      gap: 3px;
    }
    .list-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      background: var(--sc-tile-bg);
      border: 1px solid var(--sc-tile-border);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      min-width: 0;
    }
    .list-row:hover { background: var(--sc-tile-hover-bg); }
    .list-row.offline { opacity: 0.5; }
    .list-name {
      font-size: 0.85em;
      font-weight: 600;
      color: var(--sc-text-primary);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .list-center {
      display: flex;
      gap: 4px;
      align-items: center;
      flex-shrink: 0;
    }
    .list-power {
      font-size: 0.82em;
      font-weight: 700;
      color: var(--sc-power-color);
      font-variant-numeric: tabular-nums;
      min-width: 50px;
      text-align: right;
      flex-shrink: 0;
    }
    .list-ctrl {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .list-temp {
      font-size: 0.78em;
      color: var(--sc-text-secondary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .list-expand {
      background: transparent;
      border: 1px solid var(--sc-tog-off-border);
      border-radius: 5px;
      color: var(--sc-text-muted);
      cursor: pointer;
      font-size: 1.1em;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.15s;
      line-height: 1;
    }
    .list-expand:hover { background: var(--sc-tile-hover-bg); color: var(--sc-text-primary); }
    .list-expand.active { color: var(--shelly-orange); border-color: var(--shelly-orange); transform: rotate(90deg); }
    .list-detail {
      padding: 0 10px 6px 28px;
    }
    /* List row sizes */
    .list-row.row-sm { padding: 5px 8px; }
    .list-row.row-sm .list-name { font-size: 0.78em; }
    .list-row.row-lg { padding: 10px 14px; }
    .list-row.row-lg .list-name { font-size: 0.92em; }
  `,e([he({attribute:!1})],Le.prototype,"hass",void 0),e([ge()],Le.prototype,"_config",void 0),e([ge()],Le.prototype,"_expandedDevice",void 0),e([ge()],Le.prototype,"_closedAreas",void 0),e([ge()],Le.prototype,"_entityListOpen",void 0),e([ge()],Le.prototype,"_searchTerm",void 0),e([ge()],Le.prototype,"_bulkMode",void 0),e([ge()],Le.prototype,"_selectedDevices",void 0),e([ge()],Le.prototype,"_sortBy",void 0),e([ge()],Le.prototype,"_viewMode",void 0),e([ge()],Le.prototype,"_glowEnabled",void 0),e([ge()],Le.prototype,"_graphData",void 0),Le=Ue=e([ce("shelly-dashboard-card")],Le),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(je||(je={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Ge||(Ge={}));var We;let Ve=We=class extends ne{constructor(){super(...arguments),this._bgEditArea=null,this._openSections=new Set(["rooms"])}_toggleSection(e){const t=new Set(this._openSections);t.has(e)?t.delete(e):t.add(e),this._openSections=t}setConfig(e){this._config=e}_valueChanged(e,t){if(!this._config)return;const s={...this._config,[e]:t};(""===t||void 0===t||Array.isArray(t)&&0===t.length)&&delete s[e],function(e,t,s,i){i=i||{},s=null==s?{}:s;var r=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});r.detail=s,e.dispatchEvent(r)}(this,"config-changed",{config:s})}_toggleArea(e,t){const s=t.includes(e)?t.filter(t=>t!==e):[...t,e];this._valueChanged("areas",s)}_toggleSensor(e,t){const s=t.includes(e)?t.filter(t=>t!==e):[...t,e];this._valueChanged("sensors",s)}_toggleGraph(e,t){const s=t.includes(e)?t.filter(t=>t!==e):[...t,e];this._valueChanged("graph_sensors",s)}_getDiscoveredDevices(){if(!this.hass)return[];const e=this._config;let t=e.include_all?$e(this.hass):xe(this.hass,ye(this.hass));const s=e.areas;if(s&&s.length>0){const e=new Set(s.map(e=>e.toLowerCase()));t=t.filter(t=>e.has((t.area??"").toLowerCase()))}return t.map(e=>({device_id:e.device_id,name:e.name,area:e.area})).sort((e,t)=>e.name.localeCompare(t.name))}_triggerBgImageUpload(e){const t=this.renderRoot.querySelector(`input[data-area-upload="${e}"]`);t?.click()}_handleBgImageUpload(e,t){const s=t.target.files?.[0];if(!s)return;const i=new FileReader;i.onload=()=>{this._setAreaStyle(e,"bgImage",i.result)},i.readAsDataURL(s),t.target.value=""}_toggleHiddenDevice(e,t){const s=t.includes(e)?t.filter(t=>t!==e):[...t,e];this._valueChanged("hidden_devices",s)}_renderDevicePicker(e){const t=this._getDiscoveredDevices();return t.length?j`
      <div class="area-picker">
        ${t.map(t=>{const s=e.includes(t.device_id);return j`
            <div
              class="area-chip ${s?"hidden-chip":""}"
              title=${t.area?`Area: ${t.area}`:"No area assigned"}
              @click=${()=>this._toggleHiddenDevice(t.device_id,e)}
            >${t.name}${s?j` <span class="chip-x">✕</span>`:W}</div>
          `})}
      </div>
    `:j`<p class="hint">No devices discovered yet.</p>`}_setAreaStyle(e,t,s){const i=this._config,r={...i.area_styles?.[e]??{}};void 0===s||""===s||0===s?delete r[t]:r[t]=s;const o={...i.area_styles??{}};Object.keys(r).length>0?o[e]=r:delete o[e],this._valueChanged("area_styles",Object.keys(o).length>0?o:void 0)}_clearAreaStyleKeys(e,t){const s=this._config,i={...s.area_styles?.[e]??{}};for(const e of t)delete i[e];const r={...s.area_styles??{}};Object.keys(i).length>0?r[e]=i:delete r[e],this._valueChanged("area_styles",Object.keys(r).length>0?r:void 0)}_clearAreaStyle(e){const t={...this._config.area_styles??{}};delete t[e],this._valueChanged("area_styles",Object.keys(t).length>0?t:void 0)}_renderSensorPicker(e){const t=0===e.length;return j`
      <div class="area-picker">
        <div
          class="area-chip ${t?"selected":""}"
          @click=${()=>this._valueChanged("sensors",[])}
        >All sensors</div>
        ${We.SENSOR_GROUPS.map(({group:t,items:s})=>j`
          <div class="chip-group-label">${t}</div>
          ${s.map(({key:t,label:s})=>{const i=e.includes(t);return j`
              <div
                class="area-chip ${i?"selected":""}"
                @click=${()=>this._toggleSensor(t,e)}
              >${s}</div>
            `})}
        `)}
      </div>
    `}_getAreas(){return this.hass?Object.values(this.hass.areas??{}).map(e=>({id:e.area_id,name:e.name})).sort((e,t)=>e.name.localeCompare(t.name)):[]}_textInput(e,t,s,i=""){return j`
      <div class="field">
        <label>${e}</label>
        <input
          type="text"
          .value=${s??""}
          placeholder=${i}
          @change=${e=>this._valueChanged(t,e.target.value)}
        />
      </div>
    `}_toggle(e,t,s){return j`
      <div class="field row">
        <label>${e}</label>
        <input
          type="checkbox"
          .checked=${s??!1}
          @change=${e=>this._valueChanged(t,e.target.checked)}
        />
      </div>
    `}_numberInput(e,t,s,i=1,r=10){return j`
      <div class="field">
        <label>${e}</label>
        <input
          type="number"
          min=${i}
          max=${r}
          .value=${String(s??"")}
          @change=${e=>{const s=parseInt(e.target.value,10);this._valueChanged(t,isNaN(s)?void 0:s)}}
        />
      </div>
    `}_renderSection(e,t,s,i){const r=this._openSections.has(e);return j`
      <div class="acc-section">
        <div class="acc-header ${r?"open":""}" @click=${()=>this._toggleSection(e)}>
          <span class="acc-title">${t}</span>
          ${i?j`<span class="acc-badge">${i}</span>`:W}
          <span class="acc-chevron">▼</span>
        </div>
        ${r?j`<div class="acc-body">${s}</div>`:W}
      </div>
    `}_renderSensorGroupContent(e,t){const s=We.SENSOR_GROUPS.find(t=>t.group===e);if(!s)return j``;const i=s.items.filter(e=>t.includes(e.key));return j`
      <p class="hint">Select which sensors to show. Leave all unselected to show all.</p>
      <div class="area-picker">
        ${s.items.map(({key:e,label:s})=>j`
          <div class="area-chip ${t.includes(e)?"selected":""}"
            @click=${()=>this._toggleSensor(e,t)}>${s}</div>
        `)}
      </div>
      ${i.length?j`
        <button class="clear-btn" style="margin-top:6px"
          @click=${()=>this._valueChanged("sensors",t.filter(e=>!s.items.find(t=>t.key===e)))}>Clear group</button>
      `:W}
    `}_renderAreaPicker(e){const t=this._getAreas();if(!t.length)return j`<p class="hint">No areas found in Home Assistant.</p>`;const s=0===e.length;return j`
      <div class="area-picker">
        <div
          class="area-chip ${s?"selected":""}"
          @click=${()=>this._valueChanged("areas",[])}
        >All rooms</div>
        ${t.map(t=>{const s=e.includes(t.name);return j`
            <div
              class="area-chip ${s?"selected":""}"
              @click=${()=>this._toggleArea(t.name,e)}
            >${t.name}</div>
          `})}
      </div>
    `}render(){if(!this._config)return j``;const e=this._config,t=e.areas??[],s=e.sensors??[],i=this._getAreas(),r=e.area_styles??{},o=e.hidden_devices??[],a=t.length?`${t.length}`:"All",n=e=>{const t=We.SENSOR_GROUPS.find(t=>t.group===e),i=t.items.filter(e=>s.includes(e.key)).length;return i?`${i}`:"All"},l=Object.keys(r).length,c=o.length?`${o.length}`:void 0,d=j`
      <p class="hint">Pick a room to customise its background, text colour, and font.</p>
      ${i.length?j`
        <div class="area-picker">
          ${i.map(e=>{const t=!!r[e.name],s=this._bgEditArea===e.name;return j`
              <div
                class="area-chip ${s?"selected":""} ${t?"has-bg":""}"
                @click=${()=>{this._bgEditArea=s?null:e.name}}
              >${e.name}${t?" ●":""}</div>
            `})}
        </div>

        ${this._bgEditArea?(()=>{const e=this._bgEditArea,t=r[e]??{};return j`
            <div class="area-bg-group">
              <div class="area-bg-label">${e}</div>

              <div class="style-group-label">Background</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${t.bgColor?"active":""}"
                  .value=${t.bgColor??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"bgColor",t.target.value)}
                />
                ${t.bgColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"bgColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.bgColor??"default"}</span>
              </div>

              <div class="style-row style-row--full">
                <span class="style-lbl">Image</span>
                <input type="file" accept="image/*" hidden
                  data-area-upload="${e}"
                  @change=${t=>this._handleBgImageUpload(e,t)}
                />
                <button class="upload-btn" title="Upload image from device"
                  @click=${()=>this._triggerBgImageUpload(e)}>
                  ↑ Upload
                </button>
                <input type="text" class="style-text"
                  .value=${t.bgImage?.startsWith("data:")?"(embedded image)":t.bgImage??""}
                  placeholder="/local/images/room.jpg or https://..."
                  @change=${t=>{const s=t.target.value;this._setAreaStyle(e,"bgImage",s&&"(embedded image)"!==s?s:void 0)}}
                />
                ${t.bgImage?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._clearAreaStyleKeys(e,["bgImage","bgImageSize"])}>✕</button>
                `:W}
              </div>

              ${t.bgImage?j`
                <div class="style-row">
                  <span class="style-lbl">Size</span>
                  <div class="style-btn-group">
                    ${[{val:"contain",lbl:"Fit"},{val:"cover",lbl:"Fill"},{val:"stretch",lbl:"Stretch"}].map(({val:s,lbl:i})=>j`
                      <button
                        class="style-btn ${(t.bgImageSize??"contain")===s?"active":""}"
                        @click=${()=>this._setAreaStyle(e,"bgImageSize",s)}
                      >${i}</button>
                    `)}
                  </div>
                </div>
              `:W}

              <div class="style-group-label">Border</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${t.borderColor?"active":""}"
                  .value=${t.borderColor??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"borderColor",t.target.value)}
                />
                ${t.borderColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"borderColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.borderColor??"default"}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Width</span>
                <input type="number" class="style-num"
                  min="0" max="10" step="1"
                  .value=${String(t.borderWidth??"")}
                  placeholder="1"
                  @change=${t=>{const s=parseInt(t.target.value,10);this._setAreaStyle(e,"borderWidth",isNaN(s)?void 0:s)}}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Radius</span>
                <input type="number" class="style-num"
                  min="0" max="32" step="1"
                  .value=${String(t.borderRadius??"")}
                  placeholder="0"
                  @change=${t=>{const s=parseInt(t.target.value,10);this._setAreaStyle(e,"borderRadius",isNaN(s)?void 0:s)}}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Style</span>
                <div class="style-btn-group">
                  ${["solid","dashed","dotted"].map(s=>j`
                    <button class="style-btn ${(t.borderStyle??"solid")===s?"active":""}"
                      @click=${()=>this._setAreaStyle(e,"borderStyle",s)}>${s}</button>
                  `)}
                </div>
              </div>

              <div class="style-group-label">Header</div>

              <div class="style-row">
                <span class="style-lbl">Bg</span>
                <input type="color" class="style-color ${t.headerBgColor?"active":""}"
                  title="Color 1"
                  .value=${t.headerBgColor??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"headerBgColor",t.target.value)}
                />
                <span class="style-hint style-hint--mid">→</span>
                <input type="color" class="style-color ${t.headerBgColor2?"active":""}"
                  title="Color 2 (gradient)"
                  .value=${t.headerBgColor2??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"headerBgColor2",t.target.value)}
                />
                ${t.headerBgColor?j`
                  <button class="style-clr" title="Clear both"
                    @click=${()=>{this._setAreaStyle(e,"headerBgColor",void 0),this._setAreaStyle(e,"headerBgColor2",void 0),this._setAreaStyle(e,"headerBgDir",void 0)}}>✕</button>
                `:W}
              </div>

              ${t.headerBgColor&&t.headerBgColor2?j`
                <div class="style-row">
                  <span class="style-lbl">Dir</span>
                  <div class="style-btn-group">
                    ${[{val:"to right",lbl:"→"},{val:"to left",lbl:"←"},{val:"to bottom",lbl:"↓"},{val:"to top",lbl:"↑"},{val:"135deg",lbl:"↘"},{val:"45deg",lbl:"↗"}].map(({val:s,lbl:i})=>j`
                      <button class="style-btn style-btn--icon ${(t.headerBgDir??"to right")===s?"active":""}"
                        @click=${()=>this._setAreaStyle(e,"headerBgDir",s)}>${i}</button>
                    `)}
                  </div>
                </div>
              `:W}

              <div class="style-row">
                <span class="style-lbl">Text Color</span>
                <input type="color" class="style-color ${t.headerTextColor?"active":""}"
                  .value=${t.headerTextColor??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"headerTextColor",t.target.value)}
                />
                ${t.headerTextColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"headerTextColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.headerTextColor??"default"}</span>
              </div>

              <div class="style-group-label">Name Text</div>

              <div class="style-row">
                <span class="style-lbl">Color</span>
                <input type="color" class="style-color ${t.textColor?"active":""}"
                  .value=${t.textColor??"#ff6a00"}
                  @change=${t=>this._setAreaStyle(e,"textColor",t.target.value)}
                />
                ${t.textColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"textColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.textColor??"default"}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Size</span>
                <input type="number" class="style-num"
                  min="8" max="48" step="1"
                  .value=${String(t.fontSize??"")}
                  placeholder="—"
                  @change=${t=>{const s=parseInt(t.target.value,10);this._setAreaStyle(e,"fontSize",isNaN(s)?void 0:s)}}
                />
                <span class="style-unit">px</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Weight</span>
                <div class="style-btn-group">
                  <button class="style-btn ${t.fontWeight&&"normal"!==t.fontWeight?"":"active"}"
                    @click=${()=>this._setAreaStyle(e,"fontWeight","normal")}>Normal</button>
                  <button class="style-btn ${"bold"===t.fontWeight?"active":""}"
                    @click=${()=>this._setAreaStyle(e,"fontWeight","bold")}>Bold</button>
                </div>
              </div>

              <div class="style-row">
                <span class="style-lbl">Style</span>
                <div class="style-btn-group">
                  <button class="style-btn ${t.fontStyle&&"normal"!==t.fontStyle?"":"active"}"
                    @click=${()=>this._setAreaStyle(e,"fontStyle","normal")}>Normal</button>
                  <button class="style-btn ${"italic"===t.fontStyle?"active":""}"
                    @click=${()=>this._setAreaStyle(e,"fontStyle","italic")}>Italic</button>
                </div>
              </div>

              <div class="style-group-label">Tiles</div>

              <div class="style-row">
                <span class="style-lbl">Bg Color</span>
                <input type="color" class="style-color ${t.tileBgColor?"active":""}"
                  .value=${t.tileBgColor??"#1c1c1e"}
                  @change=${t=>this._setAreaStyle(e,"tileBgColor",t.target.value)}
                />
                ${t.tileBgColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"tileBgColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.tileBgColor??"default"}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Border</span>
                <input type="color" class="style-color ${t.tileBorderColor?"active":""}"
                  .value=${t.tileBorderColor??"#ffffff"}
                  @change=${t=>this._setAreaStyle(e,"tileBorderColor",t.target.value)}
                />
                ${t.tileBorderColor?j`
                  <button class="style-clr" title="Clear"
                    @click=${()=>this._setAreaStyle(e,"tileBorderColor",void 0)}>✕</button>
                `:W}
                <span class="style-hint">${t.tileBorderColor??"default"}</span>
              </div>

              <div class="style-row">
                <span class="style-lbl">Columns</span>
                <input type="number" class="style-num"
                  min="1" max="6" step="1"
                  .value=${String(t.columns??"")}
                  placeholder="—"
                  @change=${t=>{const s=parseInt(t.target.value,10);this._setAreaStyle(e,"columns",isNaN(s)?void 0:s)}}
                />
                <span class="style-hint" style="margin-left:4px">overrides global</span>
              </div>

              <div class="style-group-label">Effects</div>

              <div class="style-row">
                <span class="style-lbl">Shadow</span>
                <div class="style-btn-group">
                  ${["none","soft","medium","strong"].map(s=>j`
                    <button class="style-btn ${(t.boxShadow??"none")===s?"active":""}"
                      @click=${()=>this._setAreaStyle(e,"boxShadow",s)}>${s}</button>
                  `)}
                </div>
              </div>

              ${Object.keys(t).length?j`
                <button class="clear-btn" @click=${()=>this._clearAreaStyle(e)}>
                  Clear all styles
                </button>
              `:W}
            </div>
          `})():W}
      `:j`<p class="hint">No areas found in Home Assistant.</p>`}
    `;return j`
      <div class="editor">
        ${this._renderSection("rooms","Rooms to display",j`
            <p class="hint">Select which rooms to show. Leave all unselected to show every room.</p>
            ${this._renderAreaPicker(t)}
          `,a)}

        ${this._renderSection("electrical","Electrical",this._renderSensorGroupContent("Electrical",s),n("Electrical"))}

        ${this._renderSection("environmental","Environmental",this._renderSensorGroupContent("Environmental",s),n("Environmental"))}

        ${this._renderSection("device","Devices",this._renderSensorGroupContent("Device",s),n("Device"))}

        ${this._renderSection("alerts","Alerts",this._renderSensorGroupContent("Alerts",s),n("Alerts"))}

        ${(()=>{const t=e.graph_sensors??[],s=t.length?`${t.length}`:void 0;return this._renderSection("graphs","Graphs",j`
            <p class="hint">Select which sensor types show as mini graphs on tiles. Each selected type appears as its own labeled row.</p>
            <div class="area-picker">
              ${We.GRAPH_TYPES.map(({key:e,label:s})=>j`
                <div class="area-chip ${t.includes(e)?"selected":""}"
                  @click=${()=>this._toggleGraph(e,t)}>${s}</div>
              `)}
            </div>
            ${t.length?this._numberInput("History window (hours)","graph_hours",e.graph_hours??24,1,168):W}
          `,s)})()}

        ${this._renderSection("room-styles","Room Styles",d,l?`${l}`:void 0)}

        ${this._renderSection("hidden","Hidden Devices",j`
            <p class="hint">Click a device to hide it from the dashboard. Click again to show it.</p>
            ${this._renderDevicePicker(o)}
          `,c)}

        ${this._renderSection("layout","Layout",j`
          ${this._numberInput("Columns per row","columns",e.columns,1,6)}
          ${this._toggle("Show offline devices","show_offline",e.show_offline??!0)}
          ${this._toggle("Show all HA devices (not just Shelly)","include_all",e.include_all??!1)}
          ${this._toggle("Hide Shelly devices","hide_shelly",e.hide_shelly??!1)}
        `)}
      </div>
    `}};Ve.GRAPH_TYPES=[{key:"temperature",label:"Temperature"},{key:"humidity",label:"Humidity"},{key:"power",label:"Power"},{key:"energy",label:"Energy (kWh)"},{key:"voltage",label:"Voltage"},{key:"current",label:"Current"},{key:"apparent_power",label:"App. Power"},{key:"illuminance",label:"Illuminance"},{key:"carbon_dioxide",label:"CO₂"},{key:"battery",label:"Battery"}],Ve.SENSOR_GROUPS=[{group:"Electrical",items:[{key:"power",label:"Power"},{key:"apparent_power",label:"App. Power"},{key:"reactive_power",label:"React. Power"},{key:"power_factor",label:"Pwr Factor"},{key:"frequency",label:"Frequency"},{key:"energy",label:"Energy"},{key:"voltage",label:"Voltage"},{key:"current",label:"Current"}]},{group:"Environmental",items:[{key:"temperature",label:"Temperature"},{key:"humidity",label:"Humidity"},{key:"illuminance",label:"Light"},{key:"co2",label:"CO₂"},{key:"gas",label:"Gas"}]},{group:"Device",items:[{key:"battery",label:"Battery"},{key:"rssi",label:"Wi-Fi Signal"},{key:"uptime",label:"Uptime"},{key:"ip",label:"IP Address"},{key:"ssid",label:"SSID"},{key:"fw_version",label:"Firmware Ver."},{key:"mac",label:"MAC Address"},{key:"cloud",label:"Cloud"},{key:"mqtt",label:"MQTT"},{key:"eth",label:"Ethernet"}]},{group:"Alerts",items:[{key:"motion",label:"Motion"},{key:"door",label:"Door/Window"},{key:"flood",label:"Flood"},{key:"smoke",label:"Smoke"},{key:"vibration",label:"Vibration"},{key:"overpower",label:"Overpower"},{key:"overtemp",label:"Overtemp"}]}],Ve.styles=a`
    .editor { padding: 8px 0; }

    /* ── Accordion sections ──────────────────────────────────────────────── */
    .acc-section {
      border: 1px solid var(--divider-color, rgba(0,0,0,.12));
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .acc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      cursor: pointer;
      user-select: none;
      background: var(--secondary-background-color);
      transition: filter 0.15s;
    }
    .acc-header:hover { filter: brightness(1.06); }
    .acc-header.open {
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
    }
    .acc-title {
      flex: 1;
      font-size: 0.82em;
      font-weight: 700;
      color: var(--primary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .acc-badge {
      font-size: 0.72em;
      background: var(--primary-color);
      color: white;
      border-radius: 10px;
      padding: 1px 8px;
      font-weight: 700;
      line-height: 1.6;
    }
    .acc-chevron {
      font-size: 0.65em;
      color: var(--secondary-text-color);
      transition: transform 0.2s;
    }
    .acc-header.open .acc-chevron { transform: rotate(180deg); }
    .acc-body { padding: 10px 14px 12px; }

    .hint {
      font-size: 0.82em;
      color: var(--primary-text-color);
      margin: 0 0 10px;
    }

    /* Per-area style panel */
    .area-bg-group {
      border: 1px solid var(--divider-color, rgba(0,0,0,.1));
      border-radius: 8px;
      padding: 8px 10px 6px;
      margin-bottom: 10px;
    }

    .area-bg-label {
      font-size: 0.82em;
      font-weight: 700;
      color: var(--primary-text-color);
      margin-bottom: 6px;
    }

    .style-group-label {
      font-size: 0.7em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color);
      margin: 8px 0 4px;
      padding-top: 6px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,.06));
    }
    .style-group-label:first-of-type { margin-top: 0; border-top: none; padding-top: 0; }

    .style-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      min-height: 28px;
    }
    .style-row--full { flex-wrap: wrap; }

    .style-lbl {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      min-width: 42px;
      flex-shrink: 0;
    }

    .style-color {
      width: 32px;
      height: 26px;
      border: 1px solid var(--divider-color, rgba(0,0,0,.2));
      border-radius: 4px;
      padding: 1px 2px;
      cursor: pointer;
      background: none;
      flex-shrink: 0;
      opacity: 0.45;
    }
    .style-color.active { opacity: 1; }

    .style-hint {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-family: monospace;
    }
    .style-hint--mid { font-family: inherit; opacity: 0.5; }

    .style-text {
      flex: 1;
      min-width: 0;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.85em;
      color: var(--primary-text-color);
    }

    .style-num {
      width: 54px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.85em;
      color: var(--primary-text-color);
      text-align: center;
    }

    .style-unit {
      font-size: 0.78em;
      color: var(--secondary-text-color);
    }

    .upload-btn {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.2));
      border-radius: 6px;
      color: var(--primary-text-color);
      font-size: 0.8em;
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .upload-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .style-clr {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      font-size: 0.75em;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      line-height: 1;
      flex-shrink: 0;
    }
    .style-clr:hover { color: var(--error-color, #f44336); }

    .style-btn-group {
      display: flex;
      gap: 4px;
    }

    .style-btn {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      color: var(--secondary-text-color);
      font-size: 0.8em;
      padding: 3px 10px;
      cursor: pointer;
    }
    .style-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      font-weight: 600;
    }
    .style-btn--icon { padding: 3px 7px; min-width: 28px; text-align: center; }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    .field.row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    label {
      font-size: 0.875em;
      color: var(--primary-text-color);
    }

    input[type="text"],
    input[type="number"] {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 0.9em;
      color: var(--primary-text-color);
      width: 100%;
      box-sizing: border-box;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    /* Area chip picker */
    .area-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 4px;
    }

    .area-chip {
      padding: 5px 13px;
      border-radius: 20px;
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
      border: 1px solid var(--divider-color, rgba(0,0,0,.15));
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .area-chip:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .area-chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      font-weight: 600;
    }

    .area-chip.has-bg {
      border-color: var(--accent-color, #ff9800);
    }

    .area-chip.hidden-chip {
      background: var(--error-color, #f44336);
      border-color: var(--error-color, #f44336);
      color: white;
      font-weight: 600;
    }
    .area-chip.hidden-chip:hover {
      filter: brightness(0.88);
    }

    .chip-x {
      font-size: 0.8em;
      opacity: 0.85;
    }

    .clear-btn {
      background: none;
      border: 1px solid var(--error-color, #f44336);
      border-radius: 6px;
      color: var(--error-color, #f44336);
      font-size: 0.8em;
      padding: 4px 10px;
      cursor: pointer;
      margin-bottom: 6px;
    }
    .clear-btn:hover { background: var(--error-color, #f44336); color: white; }

    /* Group label inside chip picker — forces a new row */
    .chip-group-label {
      width: 100%;
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--secondary-text-color);
      font-weight: 700;
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,.06));
    }
  `,e([he({attribute:!1})],Ve.prototype,"hass",void 0),e([ge()],Ve.prototype,"_config",void 0),e([ge()],Ve.prototype,"_bgEditArea",void 0),e([ge()],Ve.prototype,"_openSections",void 0),Ve=We=e([ce("shelly-card-editor")],Ve),window.customCards=window.customCards||[],window.customCards.push({type:"shelly-dashboard-card",name:"Shelly Dashboard",description:"Fleet overview of all Shelly devices — auto-discovered from Home Assistant.",preview:!0,documentationURL:"https://github.com/TheIcelandicguy/shelly-dashboard-card"}),console.info("%c SHELLY-DASHBOARD-CARD %c v1.0.0 ","color: white; background: #1565c0; padding: 2px 6px; border-radius: 3px 0 0 3px; font-weight: bold;","color: #1565c0; background: #e3f2fd; padding: 2px 6px; border-radius: 0 3px 3px 0;");
