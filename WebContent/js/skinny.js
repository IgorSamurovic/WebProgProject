/*! skinny.js v0.1.0 | Copyright 2013 Vistaprint | vistaprint.github.io/SkinnyJS/LICENSE 
http://vistaprint.github.io/SkinnyJS/download-builder.html?modules=jquery.delimitedString,jquery.queryString*/

!function(a){a.encodeDelimitedString=function(a,b,c,d,e){if(!a)return"";d=d||function(a){return a},e=e||d;var f=[];for(var g in a)a.hasOwnProperty(g)&&f.push(d(g)+c+e(a[g]));return f.join(b)},a.parseDelimitedString=function(a,b,c,d,e){d=d||function(a){return a},e=e||d;var f={};if(a)for(var g=a.split(b),h=g.length,i=0;h>i;i++){var j=g[i];if(j.length>0){var k,l,m=j.indexOf(c);m>0&&m<=j.length-1?(k=j.substring(0,m),l=j.substring(m+1)):k=j,f[d(k)]=e(l)}}return f}}(jQuery);;!function(a){var b=/\+/gi,c=function(a){return null==a?"":decodeURIComponent(a.replace(b," "))};a.deparam=function(b){if("string"!=typeof b)throw new Error("$.deparam() expects a string for 'queryString' argument.");return b&&"?"==b.charAt(0)&&(b=b.substring(1,b.length)),a.parseDelimitedString(b,"&","=",c)},a.parseQueryString=a.deparam,a.currentQueryString=function(){return a.deparam(window.location.search)},a.appendQueryString=function(b,c){var d=a.param(c);return d.length>0&&(d="?"+d),b+d}}(jQuery);