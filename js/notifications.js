const notifBar = document.querySelector("#notification-bar > div");
const notifications = {
    list: [],
};


//pushes a notification object into the list of notifications and calls the notification check function
const createNotif =({msg, theme="general"})=>{

    notifications.list.push({
        msg,
        theme,
        started: false,
        ended: false,
    });
    notifCheck();
};

//checks the list of notifications and performs checks on the first element of the notification array list
//calls it self to allow a continuous check loop until the array is cleared of notifications
const notifCheck=()=>{
    if(notifications.list.length !== 0){

        //if the notification hasnt started, set to true and add event listeners
        if(!notifications.list[0].started){

            notifBar.innerHTML = notifItem(notifications.list[0]);
            notifications.list[0].started = true;

            //animation end
            notifBar.children[0].addEventListener('animationend', ()=>{
                notifications.list[0].ended = true;
                notifCheck();
                return;
            });

            //close button
            notifBar.children[0].querySelector(".notif-close").addEventListener("click", ()=>{
                notifications.list[0].ended = true;
                notifCheck();
                return;
            });
            
        }

        //if animation has ended, remove from array, clear the notification bar and perform the check again
        if(notifications.list[0].ended){
            notifications.list.shift();
            notifBar.innerHTML = "";
            notifCheck();
            return;
        }
    }
};

//notification item template
const notifItem = ({msg, theme}) =>{

    const themeList = {
        general: {
            icon: 'fa-info-circle',
            elClass: '',
            startText: "Information:"
        },
        error: {
            icon: 'fa-times-circle',
            elClass: 'notif-error',
            startText: "Error:"
        },
        success: {
            icon: 'fa-check-circle-o',
            elClass: 'notif-success',
            startText: "Success:"
        }
    };

    return `
    <div class="notif-item display-box1 ${themeList[theme].elClass}">
        <div>
            <i class="fa ${themeList[theme].icon}"></i>
        </div>
        <div><b>${themeList[theme].startText}</b><br>${msg}</div>
        <div class="notif-close"><i class="fa fa-times"></i></div>
    </div>
    `;
};