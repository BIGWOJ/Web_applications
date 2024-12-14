//Checking if browser supports webp image format by trying to load test image
function is_webp_supported(callback) {
    const test_webp_image = new Image();
    test_webp_image.type = "image/webp";
    test_webp_image.src = "photos/test.webp";
    test_webp_image.onload = function() {
        return callback(true);
    };
    test_webp_image.onerror = function() {
        return callback(false);
    };
}

//Loading images based on webp support
function load_images(webp_supported) {
    document.querySelectorAll("picture").forEach(picture => {
        const sources = picture.querySelectorAll(
            webp_supported ? "[data-srcset-webp]" : "[data-srcset-fallback]"
        );

        // Update all <source> elements
        sources.forEach(source => {
            const srcset_attribute = webp_supported ? 'data-srcset-webp' : 'data-srcset-fallback';
            source.srcset = source.getAttribute(srcset_attribute);
        });

        // Update <img> fallback source
        const image = picture.querySelector("img");
        const src_attribute = webp_supported ? 'data-src-webp' : 'data-src-fallback';
        if (image.hasAttribute(src_attribute)) {
            image.src = image.getAttribute(src_attribute);
        }
    });
}


//Calling functions
// is_webp_supported(function(webp_supported)
// {
//     webp_supported = false;
//     load_images(webp_supported);
//     console.log(webp_supported);
// });

load_images(false);
