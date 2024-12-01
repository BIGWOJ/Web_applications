let current_theme = "page1";
let themes = {
    page1: "styles/page1.css",
    page2: "styles/page2.css",
    page3: "styles/page3.css"
};

function change_theme(theme: string) {
    const node_list = document.querySelectorAll("link[rel=stylesheet]");
    const theme_link = node_list[0] as HTMLLinkElement;
    theme_link.href = `styles/${theme}.css`;
    current_theme = theme;

    if (theme === "page2") {
        const theme_buttons = document.querySelectorAll(".theme_button");
        for (let theme_counter = 0; theme_counter < theme_buttons.length; theme_counter++) {
            (theme_buttons[theme_counter] as HTMLElement).style.left = `${theme_counter * 2.5 + 27}%`;
        }
    }
    else {
        const theme_buttons = document.querySelectorAll(".theme_button");
        for (let theme_counter = 0; theme_counter < theme_buttons.length; theme_counter++) {
            (theme_buttons[theme_counter] as HTMLElement).style.left = `${theme_counter * 5 + 9}%`;
        }
    }
}

window.onload = function() {
    const theme_list = Object.keys(themes) as (keyof typeof themes)[];

    for (let theme_counter = 0; theme_counter < theme_list.length; theme_counter++) {
        const button = document.createElement("button");
        button.className = "theme_button";
        button.innerHTML = `Styl ${theme_counter + 1}`;
        button.style.left = `${theme_counter * 2.5 + 27}%`;

        button.onclick = () => {
            const selected_theme = theme_list[theme_counter];
            change_theme(selected_theme);
        };

        document.querySelector(".footer")?.appendChild(button);
    }
};
