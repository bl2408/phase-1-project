const nav = document.querySelector("body > nav");
const navButtons = document.querySelector("#nav-buttons");
const navIndicator = document.querySelector("#nav-indicator");
const mainContent = document.querySelector("body > main");

//initialize the nav settings
const navInit = ()=>{
    app.page = 0;
    app.buttonList = navButtons.querySelectorAll("button");
    app.sectionList = mainContent.querySelectorAll("section");

    //when main content scrolls, it will position the indicator based of a percentage of the main section position
    //resize the indicator to the button
    mainContent.addEventListener("scroll", (e)=>{
        const percentage = Math.abs(mainContent.children[0].getBoundingClientRect().x) / (mainContent.scrollWidth - mainContent.clientWidth);
        navIndicator.style.left = `${((navButtons.clientWidth - navIndicator.clientWidth) * percentage)}px`;
        indicatorResize();
    });

    //sets the current page to the index of the button
    app.buttonList.forEach(button => {
        button.addEventListener("click", (e)=>{
            app.page = [...app.buttonList].indexOf(e.target);
            sectionMove();
        });
    });
};
navInit();

//scrolls the main section content
const sectionMove=()=>{
    app.sectionList[app.page].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
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
    indicatorMove();
});



