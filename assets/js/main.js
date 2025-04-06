(()=>{"use strict";var e={n:t=>{var n=t&&t.__esModule?()=>t.default:()=>t;return e.d(n,{a:n}),n},d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.React,n=window.wp.element,r=window.wp.apiFetch;var a=e.n(r);const l="/rz-file-manager/v1",o=async(e,t)=>{try{const n=new FormData;n.append("file",t),n.append("current_path",e);const r="rz-file-manager/v1";let a=window.rzFileManagerData?.restUrl||`/wp-json/${r}`;a.endsWith("/")&&(a=a.slice(0,-1));const l=`${a}/upload`,o=await fetch(l,{method:"POST",headers:{"X-WP-Nonce":window.rzFileManagerData?.nonce||window.rzFileManagerData?.restNonce},body:n});return await o.json()}catch(e){let t="Network error during upload";if(e.response)try{t=(await e.response.json()).message||e.response.statusText}catch(n){t=e.response.statusText}else e.message&&(t=e.message);return{success:!1,message:t}}},i=async e=>{try{return await a()({path:`${l}/delete`,method:"DELETE",data:{path:e}})}catch(e){return{success:!1,message:e.message}}},c=(0,n.createContext)(),s=({children:e})=>{const[r,s]=(0,n.useState)(""),[u,m]=(0,n.useState)([]),[d,f]=(0,n.useState)([]),[g,p]=(0,n.useState)(!1),[h,y]=(0,n.useState)(null),[_,E]=(0,n.useState)(null),[v,w]=(0,n.useState)("name"),[b,z]=(0,n.useState)("asc"),[M,O]=(0,n.useState)({visible:!1,x:0,y:0,item:null}),[C,N]=(0,n.useState)({isOpen:!1,file:null,content:"",isLoading:!1,error:null}),[S,j]=(0,n.useState)({isOpen:!1,item:null}),[k,x]=(0,n.useState)({isOpen:!1}),[D,F]=(0,n.useState)({isOpen:!1,itemToDelete:null}),[R,P]=(0,n.useState)({isOpen:!1}),[T,I]=(0,n.useState)(null),B=async()=>{p(!0),y(null);try{const e=await(async(e="")=>{try{const t=`${window.rzFileManagerData?.restUrl}list`,n=await fetch(`${t}?path=${encodeURIComponent(e)}`,{method:"GET",credentials:"include",headers:{"X-WP-Nonce":window.rzFileManagerData?.restNonce,"Content-Type":"application/json"}});if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);return await n.json()}catch(e){return{success:!1,message:e.message}}})(r);if(e.success){const t=$(e.items,v,b);m(t)}else y(e.message||"Failed to load files")}catch(e){y("Error loading files: "+(e.message||"Unknown error"))}finally{p(!1)}},$=(e,t,n)=>[...e].sort(((e,r)=>{if("directory"===e.type&&"directory"!==r.type)return-1;if("directory"!==e.type&&"directory"===r.type)return 1;let a=0;return"name"===t?a=e.name.localeCompare(r.name,void 0,{numeric:!0,sensitivity:"base"}):"size"===t?a=("directory"===e.type?-1:e.size)-("directory"===r.type?-1:r.size):"modified"===t&&(a=e.modified-r.modified),"asc"===n?a:-1*a})),L=async e=>{p(!0),y(null);try{const t=await(async(e,t)=>{try{return await a()({path:`${l}/create-folder`,method:"POST",data:{path:e,name:t}})}catch(e){return{success:!1,message:e.message}}})(r,e);t.success?(E(t.message||"Folder created successfully"),await B()):y(t.message||"Failed to create folder")}catch(e){y("Error creating folder: "+(e.message||"Unknown error"))}finally{p(!1)}},U=async e=>{if(!e||0===e.length)return y("No files selected for upload."),setTimeout((()=>y(null)),3e3),void le();p(!0),y(null),I(null);let t=!0,n="";try{for(let n=0;n<e.length;n++){const a=e[n],l=await o(r,a);l.success||(y(`Failed to upload ${a.name}: ${l.message||"Unknown error"}`),I(l.message||"An unknown error occurred."),t=!1)}t&&(n=e.length>1?"Files uploaded successfully":"File uploaded successfully",E(n)),await B()}catch(e){y("Error uploading files: "+(e.message||"Unknown error")),I(e.message||"A critical error occurred during upload."),t=!1}finally{p(!1),t&&le()}},A=async()=>{if(0!==d.length){p(!0),y(null);try{for(const e of d){const t=await i(e.path);if(!t.success){y(`Failed to delete ${e.name}: ${t.message||"Unknown error"}`);break}}E("Items deleted successfully"),f([]),await B()}catch(e){y("Error deleting items: "+(e.message||"Unknown error"))}finally{p(!1)}}},q=async()=>{if(!D.itemToDelete)return;const e=D.itemToDelete;p(!0),y(null),re();try{const t=await i(e.path);t.success?(E(t.message||"Item deleted successfully"),await B()):y(`Failed to delete ${e.name}: ${t.message||"Unknown error"}`)}catch(e){y("Error deleting item: "+(e.message||"Unknown error"))}finally{p(!1)}},V=e=>{s(e),f([])},K=()=>{if(!r)return;const e=r.split("/");e.pop();const t=e.join("/");V(t)},G=(0,n.useCallback)(((e,t)=>{const n=t.shiftKey,r=(t.ctrlKey||t.metaKey,d.some((t=>t.path===e.path)));let a=[...d];if(n&&d.length>0){const t=d[d.length-1],n=u.findIndex((e=>e.path===t.path)),r=u.findIndex((t=>t.path===e.path)),l=Math.min(n,r),o=Math.max(n,r),i=u.slice(l,o+1);a=[...a,...i]}else a=r?a.filter((t=>t.path!==e.path)):[...a,e];f(a)}),[u,d]),W=(0,n.useCallback)((()=>{const e=u.length>0&&d.length===u.length;f(e?[]:[...u])}),[u,d]),X=e=>d.some((t=>t.path===e.path)),Y=()=>{f([])},H=(e,t)=>{O({visible:!0,x:t.pageX,y:t.pageY,item:e})},Z=()=>{O((e=>({...e,visible:!1,item:null})))},J=e=>{j({isOpen:!0,item:e})},Q=()=>{j({isOpen:!1,item:null})},ee=()=>{x({isOpen:!0})},te=()=>{x({isOpen:!1})},ne=e=>{F({isOpen:!0,itemToDelete:e})},re=()=>{F({isOpen:!1,itemToDelete:null})},ae=(0,n.useCallback)((()=>{P({isOpen:!0})}),[]),le=(0,n.useCallback)((()=>{P({isOpen:!1})}),[]),oe=(0,n.useCallback)((()=>{I(null)}),[]);(0,n.useEffect)((()=>{B()}),[r,v,b]),(0,n.useEffect)((()=>{if(_){const e=setTimeout((()=>{E(null)}),3e3);return()=>clearTimeout(e)}}),[_]);const ie=e=>{const t=v===e&&"asc"===b?"desc":"asc";w(e),z(t),m((n=>$(n,e,t)))},ce=async e=>{if("file"===e.type){N({isOpen:!0,file:e,content:"",isLoading:!0,error:null});try{const t=await(async e=>{const t=`${l}/get-content?path=${encodeURIComponent(e)}`;try{return await a()({path:t,method:"GET"})}catch(e){return{success:!1,message:e.message}}})(e.path);if(!t.success)throw new Error(t.message||"Failed to load file content.");N((e=>({...e,content:t.content,isLoading:!1})))}catch(e){N((t=>({...t,isLoading:!1,error:e.message})))}}},se=()=>{N({isOpen:!1,file:null,content:"",isLoading:!1,error:null})},ue=async()=>{if(C.file){N((e=>({...e,isLoading:!0,error:null})));try{const e=await(async(e,t)=>{try{return await a()({path:`${l}/save-content`,method:"POST",data:{path:e,content:t}})}catch(e){return{success:!1,message:e.message}}})(C.file.path,C.content);if(!e.success)throw new Error(e.message||"Failed to save file content.");se(),E(e.message||"File saved successfully!")}catch(e){N((t=>({...t,isLoading:!1,error:e.message})))}}},me=e=>{N((t=>({...t,content:e})))},de=(0,n.useMemo)((()=>({currentPath:r,items:u,selectedItems:d,loading:g,error:h,successMessage:_,uploadError:T,clearUploadError:oe,loadItems:B,handleCreateFolder:L,handleUploadFiles:U,handleDeleteSelectedItems:A,handleDeleteItem:q,navigateTo:V,navigateToParent:K,toggleSelectItem:G,toggleSelectAll:W,areAllItemsSelected:u.length>0&&d.length===u.length,isItemSelected:X,clearSelection:Y,sortKey:v,sortDirection:b,setSort:ie,contextMenu:M,showContextMenu:H,hideContextMenu:Z,editorState:C,openFileEditor:ce,closeFileEditor:se,saveEditedFile:ue,handleEditorContentChange:me,renameModalState:S,openRenameModal:J,closeRenameModal:Q,createFolderModalState:k,openCreateFolderModal:ee,closeCreateFolderModal:te,deleteModalState:D,openDeleteModal:ne,closeDeleteModal:re,uploadModalState:R,openUploadModal:ae,closeUploadModal:le})),[r,u,d,g,h,_,T,v,b,M,C,S,k,D,R]);return(0,t.createElement)(c.Provider,{value:de},e)},u=()=>(0,n.useContext)(c),m=window.wp.i18n,d=window.wp.components,f=({onCreateFolder:e,onUpload:n,onDelete:r})=>{const{selectedItems:a,navigateToParent:l,loadItems:o,currentPath:i}=u();return(0,t.createElement)("div",{className:"rz-file-manager__toolbar"},(0,t.createElement)("div",{className:"rz-file-manager__toolbar-left"},(0,t.createElement)(d.Button,{variant:"secondary",onClick:()=>{l()},icon:"arrow-up-alt2",disabled:!i,className:"rz-file-manager__toolbar-button"},(0,m.__)("Parent Directory","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"secondary",onClick:()=>{o()},icon:"update",className:"rz-file-manager__toolbar-button"},(0,m.__)("Refresh","rz-file-manager"))),(0,t.createElement)("div",{className:"rz-file-manager__toolbar-right"},(0,t.createElement)(d.Button,{variant:"primary",onClick:e,icon:"plus",className:"rz-file-manager__toolbar-button"},(0,m.__)("New Folder","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"primary",onClick:n,icon:"upload",className:"rz-file-manager__toolbar-button"},(0,m.__)("Upload","rz-file-manager")),a.length>0&&(0,t.createElement)(d.Button,{variant:"secondary",onClick:r,icon:"trash",isDestructive:!0,className:"rz-file-manager__toolbar-button"},(0,m.__)("Delete","rz-file-manager"))))},g=()=>{const{currentPath:e,navigateTo:n}=u(),r=(()=>{const t=[{name:(0,m.__)("Root","rz-file-manager"),path:""}];if(!e)return t;const n=e.split("/");let r="";for(let e=0;e<n.length;e++)n[e]&&(r+=(r?"/":"")+n[e],t.push({name:n[e],path:r}));return t})();return(0,t.createElement)("div",{className:"rz-file-manager__breadcrumbs"},r.map(((e,r)=>(0,t.createElement)("span",{key:e.path},r>0&&(0,t.createElement)("span",{className:"rz-file-manager__breadcrumbs-separator"},"/"),(0,t.createElement)("a",{href:"#",className:"rz-file-manager__breadcrumbs-item",onClick:t=>{return r=e.path,t.preventDefault(),void n(r);var r}},e.name)))))},p=({item:e,onRename:n})=>{const{navigateTo:r,toggleSelectItem:a,isItemSelected:l,showContextMenu:o,handleDeleteItems:i,openFileEditor:c}=u();return(0,t.createElement)("tr",{className:"rz-file-manager__file-item "+(l(e)?"is-selected":""),onClick:e=>{},onDoubleClick:()=>{"directory"===e.type?r(e.path):"file"===e.type&&c(e)},onContextMenu:t=>{t.preventDefault(),o(e,t)}},(0,t.createElement)("td",{className:"rz-file-manager__table-checkbox"},(0,t.createElement)("input",{type:"checkbox",checked:l(e),onChange:t=>{t.stopPropagation(),a(e,t)},"aria-label":`Select ${e.name}`})),(0,t.createElement)("td",{className:"rz-file-manager__table-name"},(0,t.createElement)("span",{className:`dashicons dashicons-${(()=>{if("directory"===e.type)return"portfolio";switch(e.name.split(".").pop().toLowerCase()){case"jpg":case"jpeg":case"png":case"gif":case"bmp":return"format-image";case"pdf":return"media-document";case"doc":case"docx":return"media-text";case"xls":case"xlsx":return"media-spreadsheet";case"ppt":case"pptx":return"media-interactive";case"zip":case"rar":case"7z":return"portfolio";case"txt":case"md":return"text-page";default:return"media-default"}})()}`,style:{marginRight:"8px",verticalAlign:"middle"}}),e.name),(0,t.createElement)("td",{className:"rz-file-manager__table-size"},"directory"===e.type?"-":((e,t=2)=>{if(0===e||"number"!=typeof e)return"0 Bytes";const n=t<0?0:t,r=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],a=Math.floor(Math.log(e)/Math.log(1024)),l=a<r.length?a:r.length-1;return parseFloat((e/Math.pow(1024,l)).toFixed(n))+" "+r[l]})(e.size)),(0,t.createElement)("td",{className:"rz-file-manager__table-modified"},(e=>{if(!e||"number"!=typeof e)return"-";try{const t=new Date(1e3*e);return isNaN(t.getTime())?"Invalid Date":t.toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch(e){return"Error"}})(e.modified)))},h=({onRename:e})=>{const{items:n,sortKey:r,sortDirection:a,setSort:l,toggleSelectAll:o,areAllItemsSelected:i,selectedItems:c}=u();if(0===n.length)return(0,t.createElement)("div",{className:"rz-file-manager__empty"},(0,t.createElement)("p",null,(0,m.__)("This folder is empty.","rz-file-manager")));const s=e=>{l(e)},d=e=>{if(r!==e)return null;const n="asc"===a?"dashicons dashicons-arrow-up-alt2":"dashicons dashicons-arrow-down-alt2";return(0,t.createElement)("span",{className:n,style:{marginLeft:"5px"}})};return(0,t.createElement)("div",{className:"rz-file-manager__file-list"},(0,t.createElement)("table",{className:"rz-file-manager__table"},(0,t.createElement)("thead",{className:"rz-file-manager__table-head"},(0,t.createElement)("tr",{onClick:e=>e.stopPropagation()}," ",(0,t.createElement)("th",{className:"rz-file-manager__table-checkbox"},(0,t.createElement)("input",{type:"checkbox","aria-label":(0,m.__)("Select all items","rz-file-manager"),checked:i,onChange:o,disabled:0===n.length})),(0,t.createElement)("th",{className:"rz-file-manager__table-name",onClick:()=>s("name")},(0,m.__)("Name","rz-file-manager"),d("name")),(0,t.createElement)("th",{className:"rz-file-manager__table-size",onClick:()=>s("size")},(0,m.__)("Size","rz-file-manager"),d("size")),(0,t.createElement)("th",{className:"rz-file-manager__table-modified",onClick:()=>s("modified")},(0,m.__)("Modified","rz-file-manager"),d("modified")))),(0,t.createElement)("tbody",null,n.map((n=>(0,t.createElement)(p,{key:n.path,item:n,onRename:e}))))))},y=({isOpen:e,onClose:r})=>{const{currentPath:a,handleCreateFolder:l}=u(),[o,i]=(0,n.useState)(""),[c,s]=(0,n.useState)("");return(0,t.createElement)(d.Modal,{title:(0,m.__)("Create New Folder","rz-file-manager"),onRequestClose:r,className:"rz-file-manager__modal"},(0,t.createElement)("form",{onSubmit:e=>{e.preventDefault(),o?/[\\/:*?"<>|]/.test(o)?s((0,m.__)("Folder name contains invalid characters.","rz-file-manager")):(l(o),r()):s((0,m.__)("Please enter a folder name.","rz-file-manager"))}},(0,t.createElement)("div",{className:"rz-file-manager__modal-content"},(0,t.createElement)("p",null,(0,m.__)("Create a new folder in:","rz-file-manager"),(0,t.createElement)("strong",null,a||"/")),(0,t.createElement)(d.TextControl,{label:(0,m.__)("Folder Name","rz-file-manager"),value:o,onChange:e=>{i(e),s("")},placeholder:(0,m.__)("Enter folder name","rz-file-manager"),autoFocus:!0}),c&&(0,t.createElement)("div",{className:"rz-file-manager__modal-error"},c)),(0,t.createElement)("div",{className:"rz-file-manager__modal-footer"},(0,t.createElement)(d.Button,{variant:"secondary",onClick:r},(0,m.__)("Cancel","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"primary",type:"submit"},(0,m.__)("Create Folder","rz-file-manager")))))},_=({isOpen:e,onClose:r,item:a})=>{const{handleRenameItem:l}=u(),[o,i]=(0,n.useState)(""),[c,s]=(0,n.useState)("");return(0,n.useEffect)((()=>{a&&i(a.name)}),[a]),(0,t.createElement)(d.Modal,{title:(0,m.__)("Rename","rz-file-manager"),onRequestClose:r,className:"rz-file-manager__modal"},(0,t.createElement)("form",{onSubmit:e=>{e.preventDefault(),o?/[\\/:*?"<>|]/.test(o)?s((0,m.__)("Name contains invalid characters.","rz-file-manager")):o!==a.name?(l(a.path,o),r()):r():s((0,m.__)("Please enter a name.","rz-file-manager"))}},(0,t.createElement)("div",{className:"rz-file-manager__modal-content"},(0,t.createElement)("p",null,a&&"directory"===a.type?(0,m.__)("Rename folder:","rz-file-manager"):(0,m.__)("Rename file:","rz-file-manager"),(0,t.createElement)("strong",null,a?a.name:"")),(0,t.createElement)(d.TextControl,{label:(0,m.__)("New Name","rz-file-manager"),value:o,onChange:e=>{i(e),s("")},placeholder:(0,m.__)("Enter new name","rz-file-manager"),autoFocus:!0}),c&&(0,t.createElement)("div",{className:"rz-file-manager__modal-error"},c)),(0,t.createElement)("div",{className:"rz-file-manager__modal-footer"},(0,t.createElement)(d.Button,{variant:"secondary",onClick:r},(0,m.__)("Cancel","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"primary",type:"submit"},(0,m.__)("Rename","rz-file-manager")))))},E=()=>{const{deleteModalState:e,closeDeleteModal:n,handleDeleteItem:r,loading:a}=u();if(!e.isOpen||!e.itemToDelete)return null;const l=e.itemToDelete;return(0,t.createElement)(d.Modal,{title:(0,m.__)("Confirm Deletion","rz-file-manager"),onRequestClose:n,className:"rz-file-manager__modal rz-file-manager__delete-modal",shouldCloseOnClickOutside:!0,shouldCloseOnEsc:!0},(0,t.createElement)("div",{className:"rz-file-manager__modal-content"},(0,t.createElement)("p",null,l?"directory"===l.type?(0,m.__)(`Are you sure you want to delete the folder "${l.name}" and all its contents? This action cannot be undone.`,"rz-file-manager"):(0,m.__)(`Are you sure you want to delete the file "${l.name}"? This action cannot be undone.`,"rz-file-manager"):""),(0,t.createElement)("p",{className:"rz-fm-delete-warning"},(0,m.__)("This action cannot be undone.","rz-file-manager"))),(0,t.createElement)("div",{className:"rz-file-manager__modal-footer"},(0,t.createElement)(d.Button,{variant:"secondary",onClick:n,disabled:a},(0,m.__)("Cancel","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"primary",onClick:()=>{r()},isDestructive:!0,disabled:a},a?(0,m.__)("Deleting...","rz-file-manager"):(0,m.__)("Delete","rz-file-manager"))))},v=({isOpen:e,onClose:r})=>{const{currentPath:a,handleUploadFiles:l,uploadError:o,clearUploadError:i}=u(),c=(0,n.useRef)(null),[s,f]=(0,n.useState)([]),[g,p]=(0,n.useState)({}),[h,y]=(0,n.useState)({});(0,n.useEffect)((()=>{e&&(f([]),i())}),[e,i]);const _=()=>{i(),r()};return(0,t.createElement)(d.Modal,{title:(0,m.__)("Upload Files","rz-file-manager"),onRequestClose:_,className:"rz-file-manager__modal rz-file-manager__upload-modal"},o&&(0,t.createElement)("div",{className:"rz-fm-upload-error"},"Error: ",o),(0,t.createElement)("form",{onSubmit:e=>{e.preventDefault(),0!==s.length&&l(s,a,{onProgress:(e,t)=>{p((n=>({...n,[e.name]:t})))},onError:(e,t)=>{y((n=>({...n,[e.name]:t})))},onComplete:()=>{r()}})}},(0,t.createElement)("div",{className:"rz-file-manager__modal-content"},(0,t.createElement)("p",null,(0,m.__)("Upload files to:","rz-file-manager"),(0,t.createElement)("strong",null,a||"/")),(0,t.createElement)("div",{className:"rz-file-manager__upload-area"},(0,t.createElement)("input",{type:"file",ref:c,onChange:e=>{const t=Array.from(e.target.files);f(t),p({}),y({}),i()},multiple:!0,style:{display:"none"}}),(0,t.createElement)(d.Button,{variant:"secondary",onClick:()=>{c.current.click()},className:"rz-file-manager__browse-button"},(0,m.__)("Browse Files","rz-file-manager")),(0,t.createElement)("p",{className:"rz-file-manager__upload-info"},s.length>0?(0,m.__)(`${s.length} file(s) selected`,"rz-file-manager"):(0,m.__)("No files selected","rz-file-manager"))),s.length>0&&(0,t.createElement)("div",{className:"rz-file-manager__selected-files"},(0,t.createElement)("h3",null,(0,m.__)("Selected Files","rz-file-manager")),(0,t.createElement)("ul",{className:"rz-file-manager__file-list"},s.map(((e,n)=>(0,t.createElement)("li",{key:n,className:"rz-file-manager__file-item"},(0,t.createElement)("div",{className:"rz-file-manager__file-info"},(0,t.createElement)("span",{className:"rz-file-manager__file-name"},e.name),(0,t.createElement)("span",{className:"rz-file-manager__file-size"},"(",(e=>{if(0===e)return"0 Bytes";const t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(2))+" "+["Bytes","KB","MB","GB","TB"][t]})(e.size),")")),void 0!==g[e.name]&&(0,t.createElement)(d.ProgressBar,{value:g[e.name],className:"rz-file-manager__progress"}),h[e.name]&&(0,t.createElement)("div",{className:"rz-file-manager__file-error"},h[e.name]))))))),(0,t.createElement)("div",{className:"rz-file-manager__modal-footer"},(0,t.createElement)(d.Button,{variant:"secondary",onClick:_},(0,m.__)("Cancel","rz-file-manager")),(0,t.createElement)(d.Button,{variant:"primary",type:"submit",disabled:0===s.length},(0,m.__)("Upload","rz-file-manager")))))};function w(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function b(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function z(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?b(Object(n),!0).forEach((function(t){w(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):b(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function M(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function O(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function C(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function N(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?C(Object(n),!0).forEach((function(t){O(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):C(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function S(e){return function t(){for(var n=this,r=arguments.length,a=new Array(r),l=0;l<r;l++)a[l]=arguments[l];return a.length>=e.length?e.apply(this,a):function(){for(var e=arguments.length,r=new Array(e),l=0;l<e;l++)r[l]=arguments[l];return t.apply(n,[].concat(a,r))}}}function j(e){return{}.toString.call(e).includes("Object")}function k(e){return"function"==typeof e}var x=S((function(e,t){throw new Error(e[t]||e.default)}))({initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"}),D=function(e,t){return j(t)||x("changeType"),Object.keys(t).some((function(t){return n=e,r=t,!Object.prototype.hasOwnProperty.call(n,r);var n,r}))&&x("changeField"),t},F=function(e){k(e)||x("selectorType")},R=function(e){k(e)||j(e)||x("handlerType"),j(e)&&Object.values(e).some((function(e){return!k(e)}))&&x("handlersType")},P=function(e){var t;e||x("initialIsRequired"),j(e)||x("initialType"),t=e,Object.keys(t).length||x("initialContent")};function T(e,t){return k(t)?t(e.current):t}function I(e,t){return e.current=N(N({},e.current),t),t}function B(e,t,n){return k(t)?t(e.current):Object.keys(n).forEach((function(n){var r;return null===(r=t[n])||void 0===r?void 0:r.call(t,e.current[n])})),n}const $=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};P(e),R(t);var n={current:e},r=S(B)(n,t),a=S(I)(n),l=S(D)(e),o=S(T)(n);return[function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(e){return e};return F(e),e(n.current)},function(e){!function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){return t.reduceRight((function(e,t){return t(e)}),e)}}(r,a,l,o)(e)}]};var L,U={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:"Deprecation warning!\n    You are using deprecated way of configuration.\n\n    Instead of using\n      monaco.config({ urls: { monacoBase: '...' } })\n    use\n      monaco.config({ paths: { vs: '...' } })\n\n    For more please check the link https://github.com/suren-atoyan/monaco-loader#config\n  "},A=(L=function(e,t){throw new Error(e[t]||e.default)},function e(){for(var t=this,n=arguments.length,r=new Array(n),a=0;a<n;a++)r[a]=arguments[a];return r.length>=L.length?L.apply(this,r):function(){for(var n=arguments.length,a=new Array(n),l=0;l<n;l++)a[l]=arguments[l];return e.apply(t,[].concat(r,a))}})(U);const q={config:function(e){return e||A("configIsRequired"),t=e,{}.toString.call(t).includes("Object")||A("configType"),e.urls?(console.warn(U.deprecation),{paths:{vs:e.urls.monacoBase}}):e;var t}},V=function e(t,n){return Object.keys(n).forEach((function(r){n[r]instanceof Object&&t[r]&&Object.assign(n[r],e(t[r],n[r]))})),z(z({},t),n)};var K={type:"cancelation",msg:"operation is manually canceled"};const G=function(e){var t=!1,n=new Promise((function(n,r){e.then((function(e){return t?r(K):n(e)})),e.catch(r)}));return n.cancel=function(){return t=!0},n};var W,X=function(e){if(Array.isArray(e))return e}(W=$({config:{paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"}},isInitialized:!1,resolve:null,reject:null,monaco:null}))||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var t=[],_n=!0,n=!1,r=void 0;try{for(var a,l=e[Symbol.iterator]();!(_n=(a=l.next()).done)&&(t.push(a.value),2!==t.length);_n=!0);}catch(e){n=!0,r=e}finally{try{_n||null==l.return||l.return()}finally{if(n)throw r}}return t}}(W)||function(e){if(e){if("string"==typeof e)return M(e,2);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?M(e,2):void 0}}(W)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}(),Y=X[0],H=X[1];function Z(e){return document.body.appendChild(e)}function J(e){var t,n,r=Y((function(e){return{config:e.config,reject:e.reject}})),a=(t="".concat(r.config.paths.vs,"/loader.js"),n=document.createElement("script"),t&&(n.src=t),n);return a.onload=function(){return e()},a.onerror=r.reject,a}function Q(){var e=Y((function(e){return{config:e.config,resolve:e.resolve,reject:e.reject}})),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],(function(t){ee(t),e.resolve(t)}),(function(t){e.reject(t)}))}function ee(e){Y().monaco||H({monaco:e})}var te=new Promise((function(e,t){return H({resolve:e,reject:t})})),ne={config:function(e){var t=q.config(e),n=t.monaco,r=function(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}(t,["monaco"]);H((function(e){return{config:V(e.config,r),monaco:n}}))},init:function(){var e=Y((function(e){return{monaco:e.monaco,isInitialized:e.isInitialized,resolve:e.resolve}}));if(!e.isInitialized){if(H({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),G(te);if(window.monaco&&window.monaco.editor)return ee(window.monaco),e.resolve(window.monaco),G(te);!function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){return t.reduceRight((function(e,t){return t(e)}),e)}}(Z,J)(Q)}return G(te)},__getMonacoInstance:function(){return Y((function(e){return e.monaco}))}};const re=ne;var ae={display:"flex",position:"relative",textAlign:"initial"},le={width:"100%"},oe={display:"none"},ie={container:{display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"}},ce=function({children:e}){return t.createElement("div",{style:ie.container},e)},se=(0,t.memo)((function({width:e,height:n,isEditorReady:r,loading:a,_ref:l,className:o,wrapperProps:i}){return t.createElement("section",{style:{...ae,width:e,height:n},...i},!r&&t.createElement(ce,null,a),t.createElement("div",{ref:l,style:{...le,...!r&&oe},className:o}))})),ue=function(e){(0,t.useEffect)(e,[])},me=function(e,n,r=!0){let a=(0,t.useRef)(!0);(0,t.useEffect)(a.current||!r?()=>{a.current=!1}:e,n)};function de(){}function fe(e,t,n,r){return function(e,t){return e.editor.getModel(ge(e,t))}(e,r)||function(e,t,n,r){return e.editor.createModel(t,n,r?ge(e,r):void 0)}(e,t,n,r)}function ge(e,t){return e.Uri.parse(t)}(0,t.memo)((function({original:e,modified:n,language:r,originalLanguage:a,modifiedLanguage:l,originalModelPath:o,modifiedModelPath:i,keepCurrentOriginalModel:c=!1,keepCurrentModifiedModel:s=!1,theme:u="light",loading:m="Loading...",options:d={},height:f="100%",width:g="100%",className:p,wrapperProps:h={},beforeMount:y=de,onMount:_=de}){let[E,v]=(0,t.useState)(!1),[w,b]=(0,t.useState)(!0),z=(0,t.useRef)(null),M=(0,t.useRef)(null),O=(0,t.useRef)(null),C=(0,t.useRef)(_),N=(0,t.useRef)(y),S=(0,t.useRef)(!1);ue((()=>{let e=re.init();return e.then((e=>(M.current=e)&&b(!1))).catch((e=>"cancelation"!==e?.type&&console.error("Monaco initialization: error:",e))),()=>z.current?function(){let e=z.current?.getModel();c||e?.original?.dispose(),s||e?.modified?.dispose(),z.current?.dispose()}():e.cancel()})),me((()=>{if(z.current&&M.current){let t=z.current.getOriginalEditor(),n=fe(M.current,e||"",a||r||"text",o||"");n!==t.getModel()&&t.setModel(n)}}),[o],E),me((()=>{if(z.current&&M.current){let e=z.current.getModifiedEditor(),t=fe(M.current,n||"",l||r||"text",i||"");t!==e.getModel()&&e.setModel(t)}}),[i],E),me((()=>{let e=z.current.getModifiedEditor();e.getOption(M.current.editor.EditorOption.readOnly)?e.setValue(n||""):n!==e.getValue()&&(e.executeEdits("",[{range:e.getModel().getFullModelRange(),text:n||"",forceMoveMarkers:!0}]),e.pushUndoStop())}),[n],E),me((()=>{z.current?.getModel()?.original.setValue(e||"")}),[e],E),me((()=>{let{original:e,modified:t}=z.current.getModel();M.current.editor.setModelLanguage(e,a||r||"text"),M.current.editor.setModelLanguage(t,l||r||"text")}),[r,a,l],E),me((()=>{M.current?.editor.setTheme(u)}),[u],E),me((()=>{z.current?.updateOptions(d)}),[d],E);let j=(0,t.useCallback)((()=>{if(!M.current)return;N.current(M.current);let t=fe(M.current,e||"",a||r||"text",o||""),c=fe(M.current,n||"",l||r||"text",i||"");z.current?.setModel({original:t,modified:c})}),[r,n,l,e,a,o,i]),k=(0,t.useCallback)((()=>{!S.current&&O.current&&(z.current=M.current.editor.createDiffEditor(O.current,{automaticLayout:!0,...d}),j(),M.current?.editor.setTheme(u),v(!0),S.current=!0)}),[d,u,j]);return(0,t.useEffect)((()=>{E&&C.current(z.current,M.current)}),[E]),(0,t.useEffect)((()=>{!w&&!E&&k()}),[w,E,k]),t.createElement(se,{width:g,height:f,isEditorReady:E,loading:m,_ref:O,className:p,wrapperProps:h})}));var pe=new Map,he=(0,t.memo)((function({defaultValue:e,defaultLanguage:n,defaultPath:r,value:a,language:l,path:o,theme:i="light",line:c,loading:s="Loading...",options:u={},overrideServices:m={},saveViewState:d=!0,keepCurrentModel:f=!1,width:g="100%",height:p="100%",className:h,wrapperProps:y={},beforeMount:_=de,onMount:E=de,onChange:v,onValidate:w=de}){let[b,z]=(0,t.useState)(!1),[M,O]=(0,t.useState)(!0),C=(0,t.useRef)(null),N=(0,t.useRef)(null),S=(0,t.useRef)(null),j=(0,t.useRef)(E),k=(0,t.useRef)(_),x=(0,t.useRef)(),D=(0,t.useRef)(a),F=function(e){let n=(0,t.useRef)();return(0,t.useEffect)((()=>{n.current=e}),[e]),n.current}(o),R=(0,t.useRef)(!1),P=(0,t.useRef)(!1);ue((()=>{let e=re.init();return e.then((e=>(C.current=e)&&O(!1))).catch((e=>"cancelation"!==e?.type&&console.error("Monaco initialization: error:",e))),()=>N.current?(x.current?.dispose(),f?d&&pe.set(o,N.current.saveViewState()):N.current.getModel()?.dispose(),void N.current.dispose()):e.cancel()})),me((()=>{let t=fe(C.current,e||a||"",n||l||"",o||r||"");t!==N.current?.getModel()&&(d&&pe.set(F,N.current?.saveViewState()),N.current?.setModel(t),d&&N.current?.restoreViewState(pe.get(o)))}),[o],b),me((()=>{N.current?.updateOptions(u)}),[u],b),me((()=>{!N.current||void 0===a||(N.current.getOption(C.current.editor.EditorOption.readOnly)?N.current.setValue(a):a!==N.current.getValue()&&(P.current=!0,N.current.executeEdits("",[{range:N.current.getModel().getFullModelRange(),text:a,forceMoveMarkers:!0}]),N.current.pushUndoStop(),P.current=!1))}),[a],b),me((()=>{let e=N.current?.getModel();e&&l&&C.current?.editor.setModelLanguage(e,l)}),[l],b),me((()=>{void 0!==c&&N.current?.revealLine(c)}),[c],b),me((()=>{C.current?.editor.setTheme(i)}),[i],b);let T=(0,t.useCallback)((()=>{if(S.current&&C.current&&!R.current){k.current(C.current);let t=o||r,s=fe(C.current,a||e||"",n||l||"",t||"");N.current=C.current?.editor.create(S.current,{model:s,automaticLayout:!0,...u},m),d&&N.current.restoreViewState(pe.get(t)),C.current.editor.setTheme(i),void 0!==c&&N.current.revealLine(c),z(!0),R.current=!0}}),[e,n,r,a,l,o,u,m,d,i,c]);return(0,t.useEffect)((()=>{b&&j.current(N.current,C.current)}),[b]),(0,t.useEffect)((()=>{!M&&!b&&T()}),[M,b,T]),D.current=a,(0,t.useEffect)((()=>{b&&v&&(x.current?.dispose(),x.current=N.current?.onDidChangeModelContent((e=>{P.current||v(N.current.getValue(),e)})))}),[b,v]),(0,t.useEffect)((()=>{if(b){let e=C.current.editor.onDidChangeMarkers((e=>{let t=N.current.getModel()?.uri;if(t&&e.find((e=>e.path===t.path))){let e=C.current.editor.getModelMarkers({resource:t});w?.(e)}}));return()=>{e?.dispose()}}return()=>{}}),[b,w]),t.createElement(se,{width:g,height:p,isEditorReady:b,loading:s,_ref:S,className:h,wrapperProps:y})}));const ye=()=>{const{editorState:e,closeFileEditor:n,saveEditedFile:r,handleEditorContentChange:a}=u();if(!e.isOpen)return null;const{file:l,content:o,isLoading:i,error:c}=e,s=(e=>{if(!e)return"plaintext";const t=e.split(".").pop()?.toLowerCase();switch(t){case"js":case"jsx":return"javascript";case"ts":case"tsx":return"typescript";case"css":return"css";case"scss":return"scss";case"less":return"less";case"html":return"html";case"json":return"json";case"php":return"php";case"md":return"markdown";case"yaml":case"yml":return"yaml";case"xml":return"xml";case"py":return"python";case"sql":return"sql";default:return"plaintext"}})(l?.name);return(0,t.createElement)(d.Modal,{title:l?`${(0,m.__)("Edit File","rz-file-manager")}: ${l.name}`:(0,m.__)("Edit File","rz-file-manager"),onRequestClose:n,className:"rz-file-manager-editor-modal",shouldCloseOnClickOutside:!1,isDismissible:!i},i&&!o&&(0,t.createElement)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"200px"}},(0,t.createElement)(d.Spinner,null)),!i&&c&&(0,t.createElement)("div",{className:"rz-file-manager-editor-modal__error",style:{color:"red",marginBottom:"1em"}},(0,t.createElement)("p",null,(0,t.createElement)("strong",null,(0,m.__)("Error","rz-file-manager"),":")," ",c)),(!i||o)&&!c&&(0,t.createElement)(he,{height:"60vh",language:s,value:o,theme:"vs-light",options:{lineNumbers:"on",minimap:{enabled:!1},wordWrap:"on",scrollBeyondLastLine:!1,readOnly:i},onChange:a,onMount:(e,t)=>{}}),(0,t.createElement)("div",{className:"rz-file-manager-editor-modal__actions",style:{marginTop:"1em",display:"flex",justifyContent:"flex-end"}},(0,t.createElement)(d.Button,{isSecondary:!0,onClick:n,disabled:i,style:{marginRight:"8px"}},(0,m.__)("Cancel","rz-file-manager")),(0,t.createElement)(d.Button,{isPrimary:!0,onClick:r,isBusy:i,disabled:i||!!c},(0,m.__)("Save Changes","rz-file-manager"))))},_e=window.ReactDOM,Ee=()=>{const{contextMenu:e,hideContextMenu:n,openFileEditor:r,openRenameModal:a,openDeleteModal:l}=u(),o=(0,t.useRef)(null);if((0,t.useEffect)((()=>{const t=e=>{o.current&&!o.current.contains(e.target)&&n()};return e.visible?document.addEventListener("mousedown",t):document.removeEventListener("mousedown",t),()=>{document.removeEventListener("mousedown",t)}}),[e.visible,n]),!e.visible||!e.item)return null;const i={position:"absolute",top:`${e.y}px`,left:`${e.x}px`,zIndex:1e3},c=(0,t.createElement)("div",{ref:o,className:"rz-file-manager-context-menu",style:i},(0,t.createElement)("ul",null,"file"===e.item.type&&(0,t.createElement)("li",null,(0,t.createElement)("button",{onClick:()=>{e.item&&"file"===e.item.type&&r(e.item),n()}},(0,t.createElement)("span",{className:"dashicons dashicons-edit",style:{marginRight:"5px"}})," ",(0,m.__)("Edit","rz-file-manager"))),(0,t.createElement)("li",null,(0,t.createElement)("button",{onClick:()=>{if(!e.item)return;let t;"file"===e.item.type?t=(e=>{const t=window.rzFileManagerData?.ajaxUrl,n=window.rzFileManagerData?.ajaxNonce;return`${t}?action=rz_fm_download_item&path=${e}&_wpnonce=${n}`})(e.item.path):"directory"===e.item.type&&(t=(e=>{const t=window.rzFileManagerData?.ajaxUrl,n=window.rzFileManagerData?.ajaxNonce;return`${t}?action=rz_fm_download_zip&path=${e}&_wpnonce=${n}`})(e.item.path)),t&&(window.location.href=t),n()}},(0,t.createElement)("span",{className:"dashicons dashicons-download",style:{marginRight:"5px"}})," ",(0,m.__)("Download","rz-file-manager"))),(0,t.createElement)("li",null,(0,t.createElement)("button",{onClick:()=>{e.item&&a(e.item),n()}},(0,t.createElement)("span",{className:"dashicons dashicons-edit",style:{marginRight:"5px"}})," Rename")),(0,t.createElement)("li",null,(0,t.createElement)("button",{onClick:()=>{e.item&&l(e.item),n()},style:{color:"red"}},(0,t.createElement)("span",{className:"dashicons dashicons-trash",style:{marginRight:"5px"}})," Delete"))));return(0,_e.createPortal)(c,document.body)},ve=()=>{const{loading:e,error:n,successMessage:r,clearMessages:a,renameModalState:l,openRenameModal:o,closeRenameModal:i,createFolderModalState:c,openCreateFolderModal:s,closeCreateFolderModal:m,deleteModalState:p,openDeleteModal:w,closeDeleteModal:b,hideContextMenu:z,uploadModalState:M,openUploadModal:O,closeUploadModal:C}=u();return(0,t.createElement)("div",{className:"rz-file-manager",onClick:()=>{z()}},n&&(0,t.createElement)("div",{className:"rz-file-manager__error"},(0,t.createElement)("p",null,n),(0,t.createElement)("button",{onClick:a},"×")),r&&(0,t.createElement)("div",{className:"rz-file-manager__success"},(0,t.createElement)("p",null,r),(0,t.createElement)("button",{onClick:a},"×")),(0,t.createElement)(f,{onCreateFolder:s,onDelete:w,onUpload:O}),(0,t.createElement)(g,null),e?(0,t.createElement)("div",{className:"rz-file-manager__loading"},(0,t.createElement)(d.Spinner,null)):(0,t.createElement)(h,null),c.isOpen&&(0,t.createElement)(y,{isOpen:c.isOpen,onClose:m}),l.isOpen&&(0,t.createElement)(_,{isOpen:l.isOpen,onClose:i,item:l.item}),p.isOpen&&(0,t.createElement)(E,{isOpen:p.isOpen,onClose:b}),M.isOpen&&(0,t.createElement)(v,{isOpen:M.isOpen,onClose:C}),(0,t.createElement)(Ee,null),(0,t.createElement)(ye,null))},we=()=>(0,t.createElement)(s,null,(0,t.createElement)("div",{className:"rz-file-manager-app"},(0,t.createElement)(ve,null)));document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("rz-file-manager-root");e&&(0,n.render)((0,t.createElement)(s,null,(0,t.createElement)(we,null)),e)}))})();