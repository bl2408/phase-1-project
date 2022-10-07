const nav = document.querySelector("body > nav");
const navButtons = document.querySelector("#nav-buttons");
const navIndicator = document.querySelector("#nav-indicator");
const mainContent = document.querySelector("body > main");
const btnTheme = document.querySelector("#header-nav > input[type=checkbox]");

//initialize the nav settings
const navInit = ()=>{
    app.page = 0;
    app.buttonList = navButtons.querySelectorAll("button");
    app.sectionList = mainContent.querySelectorAll("section");

    //when main content scrolls, it will position the indicator based of a percentage of the main section position
    //resize the indicator to the button
    //add active to active button
    mainContent.addEventListener("scroll", ()=>{
        const percentage = Math.abs(mainContent.children[0].getBoundingClientRect().x) / (mainContent.scrollWidth - mainContent.clientWidth);
        navIndicator.style.left = `${((navButtons.clientWidth - navIndicator.clientWidth) * percentage)}px`;
        indicatorResize();
        
        //sets the current page based of the percentage
        app.page = Math.min(Math.floor(app.buttonList.length * percentage), (app.buttonList.length-1));

        app.buttonList.forEach(button=>{
            if([...app.buttonList].indexOf(button) === app.page){
                button.classList.add("active");
            }else{
                button.classList.remove("active");
            }
        });
    });

    //sets the current page to the index of the button
    app.buttonList.forEach(button => {
        button.addEventListener("click", (e)=>{
            app.page = [...app.buttonList].indexOf(e.target);
            sectionMove();
        });
    });

    //day/night mode button
    btnTheme.addEventListener("click", e=>{
        setTheme();
    });
};
navInit();

const setTheme =(theme)=>{
    const html = document.querySelector("html")
    if(theme !== null){
        html.setAttribute('data-theme', theme);
        btnTheme.checked = theme === "dark" ? true : false;
        return;
    }
    html.setAttribute('data-theme', btnTheme.checked ? "dark" : "");
};

//scrolls the main section content
const sectionMove=()=>{
    //app.sectionList[app.page].scrollIntoView({behavior: "smooth"});
    mainContent.scrollBy({top: 0,
        left: app.sectionList[app.page].getBoundingClientRect().left,
        behavior: 'smooth'
    });
};
sectionMove();

//resizes the nav indicator to match button width
const indicatorResize =()=>{
    const buttonWid = app.buttonList[app.page].getBoundingClientRect().width;
    navIndicator.style.width = `${buttonWid}px`;
};
indicatorResize();


window.addEventListener("resize", ()=>{
    indicatorResize();
});



