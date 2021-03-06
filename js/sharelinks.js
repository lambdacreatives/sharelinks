(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.sharelinks = factory();
	}
}(this, function() {
	var platforms = {
		facebook: {
			href: 'https://www.facebook.com/sharer/sharer.php?u=%URL%',
			width: 400,
			height: 500
		},
		twitter: {
			href: 'https://twitter.com/intent/tweet?status=%TITLE%+-+%URL%',
			width: 540,
			height: 260
		},
		tumblr: {
			href: 'http://www.tumblr.com/share/link?url=%URL%',
			width: 500,
			height: 500
		},
		google: {
			href: 'https://plus.google.com/share?url=%URL%',
			width: 600,
			height: 600
		},
		linkedin: {
			href: 'http://www.linkedin.com/shareArticle?mini=true&amp;url=%URL%&amp;title=%TITLE%',
			width: 520,
			height: 570
		},
		pinterest: {
			href: 'http://pinterest.com/pin/create/button/?url=%URL%&description=%TITLE%&media=%IMAGE%',
			width: 520,
			height: 570
		}
	};

	var elements;

	return function(selector, options) {
		elements = document.querySelectorAll(selector);

		var defaults = {
			onShare : function() {}
		};

		var opts = extend({}, defaults, options);

		function extend() {
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						arguments[0][key] = arguments[i][key];
					}
				}
			}
			return arguments[0];
		}

		function makeLink(platform, url, title, image) {
			return platform.href
				.replace('%URL%',   encodeURIComponent(url).replace(/%20/g, '+'))
				.replace('%TITLE%', encodeURIComponent(title).replace(/%20/g, '+'))
				.replace('%IMAGE%', encodeURIComponent(image).replace(/%20/g, '+'));
		}

		function findImage() {
			var image = '';

			var og_image = document.querySelector('meta[property="og:image"]');

			if (og_image) {
				image = og_image.getAttribute('content');
			} else {
				var images = document.getElementsByTagName('img');

				if (images.length > 0) {
					image = images[0].getAttribute('src');
				}
			}

			return image;
		}

		function handleClick(e) {
			// Left click only! Don't hijack middle click!
			if (e.which == 1) {
				e.preventDefault();

				var width,
					height,
					image,
					href,
					elem = e.currentTarget,
					platform = platforms[elem.dataset.platform] || false;

				if (typeof platform === 'undefined') {
					// throw "Sharelinks Error: Invalid data-platform: " + $(this).data('platform');
					throw "Sharelinks Error: Invalid data-platform: " + elem.dataset.platform;
				}

				width  = elem.dataset.width  || platform.width;
				height = elem.dataset.height || platform.height;
				image  = elem.dataset.image  || findImage();

				if (elem.dataset.url) {
					href = makeLink(platform, elem.dataset.url, elem.dataset.title, image);
				} else {
					href = elem.getAttribute('href');
				}

				opts.onShare({
					platform : elem.dataset.platform,
					url 		 : elem.dataset.url || window.location.href
				});

				window.open(href, '', 'status=yes, width='+width+', height='+height);
			}
		}

		Array.prototype.forEach.call(elements, function (element) {
			var share_url, dest, title, image,
			platform = platforms[element.dataset.platform] || false;

			if (!platform) {
				// Logging rather than throwing - we want other links to work even if this one doesn't
				if (typeof console.error === 'function') {
					console.error("Sharelinks Error: Invalid data-platform: " + element.dataset.platform);
				}
			} else {
				dest  = element.dataset.url   || window.location.href;
				title = element.dataset.title || document.title;
				image = element.dataset.image || findImage();

				share_url = makeLink(platform, dest, title, image);

				element.setAttribute('href', share_url);

				if (element.addEventListener) {
					element.addEventListener('click', handleClick, false);
				} else {
					element.attachEvent('onclick', handleClick);
				}
			}
		});
	};
}));
