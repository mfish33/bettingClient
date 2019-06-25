var ss
var user ={};
var races = [];
var app = {

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        document.addEventListener("backbutton", function(){app.backButtonHandeler()}, false);
        
        if(device.platform!='browser'){
            ss = new cordova.plugins.SecureStorage(
                function() {
                  console.log("Success");
                },
                function(error) {
                  console.log("Error " + error);
                },
                "my_app"
              );
            ss.get(
                function(value) {
                document.getElementById("Username").value=value
                ss.get(
                    function(value) {
                        document.getElementById("Password").value=value
                        app.login()
                    },
                    function(error) {
                      console.log("Error " + error);
                    },
                    "password"
                  );
                },
                function(error) {
                    $("#Login").fadeIn(500);
                },
                "username"
              )
        }else{
            $("#Login").fadeIn(500);
        }
        
    },

    backButtonHandeler : function(){
        console.log("Back button pressed")
        if($("#createAcount").is(":visible")) this.returnLogin()
        else if($("#addRace").is(":visible")) this.updateInfo()
        else if($("#Login").is(":visible")) navigator.app.exitApp();
        else if($("#races").is(":visible")) this.logout()
    },

    login: function(){
        var data = {
            username: document.getElementById("Username").value,
            password : document.getElementById("Password").value
        }
        this.post("/users/android/login",data,"this.loginHandeler")
        this.saveUsernameAndPassword()
    },

    updateInfo: function(){
        var data = {
            username: document.getElementById("Username").value,
            password : document.getElementById("Password").value
        }
        this.post("/users/android/login",data,"this.loginHandeler")
    },
    
    
    loginHandeler: function(response) {
        console.log(response.SERVER_MESSAGE)
        if(response.SERVER_MESSAGE != 'Login Fail'){
            $("#createAcount").fadeOut(500);
            $("#Login").fadeOut(500);
            $("#addRace").fadeOut(500);
            $("#logo").fadeOut(500,function(){
                $("#VervicalAlignRow").removeClass("align-self-center");
                app.getRaces();
            });  
            user=response;
            
        }else $('#loginErrorMesage').html('<div class="alert alert-danger m-2"><strong>Incorect Username or Password</strong></div>');
    },

    loadCreateAcount: function () {
        $("#Login").fadeOut(500,function(){
               $("#createAcount").fadeIn(500);
            });  
    },

    createAcount:function () {
        if(document.getElementById("CreatePassword").value!=document.getElementById("ConfirmPassword").value){
            $('#createErrorMesage').html('<div class="alert alert-danger m-2"><strong>Passwords Do Not Match</strong></div>')
            return
        }
        var data = {
            username: document.getElementById("Username").value,
            password : document.getElementById("CreatePassword").value,
            password2 : document.getElementById("ConfirmPassword").value
        }
        document.getElementById("Password").value = document.getElementById("CreatePassword").value
        document.getElementById("Username").value = document.getElementById("CreateUsername").value
        this.post("/users/android/register",data,"this.createAcountHandeler")
        this.saveUsernameAndPassword()
    },

    createAcountHandeler: function (response) {
        if(response.SERVER_MESSAGE= "Acount creation successfull") this.login()
        $('#createErrorMesage').html('<div class="alert alert-danger m-2"><strong>Failed to Create Acount</strong></div>');
        
    },

    saveUsernameAndPassword:function(){
        if(device.platform!='browser'){
            ss.get(
                function(value) { },
                function(error) {
                    ss.set(function(key) {console.log("Set " + key);},function(error) {console.log("Error " + error);},
                    "username",
                    document.getElementById("Username").value);
                    ss.set(function(key) {console.log("Set " + key);},function(error) {console.log("Error " + error);},
                    "password",
                    document.getElementById("Password").value);
                },
                "username"
              )  
        }
    },

    returnLogin: function () {
        $("#createAcount").fadeOut(500,function(){
               $("#Login").fadeIn(500);
            });  
    },

    post: function(url,data,next){
        fetch('http://192.168.1.12:8080'+url, {
            method: 'POST', 
            body: JSON.stringify(data), 
            headers:{
              'Content-Type': 'application/json',
              'content-length': '51'
            }
          }).then(response => response.json())
            .then(jsondata => eval(next+'(jsondata)'))
            .catch(error => console.log(error))
    },

    get: function(url,next){
        fetch('http://192.168.1.12:8080'+url)
        .then(response => response.json())
        .then(data => {
            eval(next+'(data)')
        })
        .catch(error => console.error(error))
    },

    getRaces: function(){
        this.get('/android/','this.showRaces')
    },

    showRaces: function (json) {
        races = json;
        var httpOutput=[];
        var btnMessage
        var btnType
        var createRaceLabel
        var createRacefunc
        if(device.platform=='browser') createRaceLabel='Create Race'
        else createRaceLabel='+'
        httpOutput.push(`
        <div class="row m-1">
            <div class="col-xs-6">
                <p class="blockquote">You Have $ ${user.Money}</p>
            </div>
            <div class="col-xs-6 ml-3">
                <button type="button" class="btn btn-primary" onclick="app.updateInfo()"><i class="fa fa-refresh"></i></button>
                <button type="button" class="btn btn-primary ml-2" onclick="app.createRace()">${createRaceLabel}</button></div>
            </div>
            <ul class="list-group">`)
        for(var i=0; i<json.length; i++) {
            createRacefunc=''
            if(json[i].racers.length==json[i].maxnum){
                btnType = 'secondary'
                btnMessage = 'Race Full'
            }else if(json[i].racers.includes(user.username)){
                btnType = 'success'
                btnMessage = 'Joined'
            }else if(user.Money<json[i].bet){
                btnType = 'danger'
                btnMessage = 'Poverty'
            }else{
                btnType = 'primary'
                btnMessage = 'Join'
                createRacefunc=`onclick="app.joinRace(${i})"`
            } 
            httpOutput.push(`
            <li class="list-group-item">
                <p>${json[i].body} | bet: $${json[i].bet}</p>
                <button type="button" class="btn btn-${btnType}" ${createRacefunc}>${btnMessage}</button>
            </li>`)
         }
        
        
        httpOutput.push('</ul><div id="joinErrorMesage"></div>')
        $('#races').html(httpOutput.join('')).delay(500).fadeIn(500);;
      },

    joinRace: function(raceNum){
        var race = races[raceNum]
        var data = {
            userId:user._id,
            raceId:race._id,
            username:user.username
        }
        this.post('/articles/android/addPerson',data,'this.handleRaceJoin')
    },

    handleRaceJoin: function(data){
        if(data.SERVER_MESSAGE=='Joined Race Sucsessfully') this.updateInfo()
        else $('#joinErrorMesage').html('<div class="alert alert-danger m-2"><strong>Failed To Join Race</strong></div>');
    },

    createRace: function () {
          $('#races').fadeOut(500,function () {
            $('#addRace').html(`<p class="h1">Add Race</p>
            <p class="blockquote">You Have $ ${user.Money}</p>
            <form name = "createRace">
            <div class="form-group">
                 <input class="form-control" id="raceBodyRules" placeholder="Track Rules">
            </div>
            <div class="form-group">
              <input class="form-control" id="raceBodyWin" placeholder="win Condition">
           </div>
            <div class="form-group">
                 <input class="form-control" id="bet" placeholder="bet" type="number" min="0" data-bind="value:replyNumber">
            </div>
            <div class="form-group">
                <select class="custom-select mr-sm-2" id="maxnum">
                    <option selected>Number of Racers</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
            <div class="row m-1">
                <div class="col text-center">
                    <button type="button" class="btn btn-danger" onclick="app.updateInfo()">Cancel</button>
                </div>
                <div class="col text-center">
                    <button type="button" class="btn btn-primary" onclick="app.addRace()">Submit</button>
                </div> 
            </div>
             
           </form>
           <div id='createRaceErrorMesage'>
           </div>`).fadeIn(500);
            }) 
    },

    addRace: function () {
        if(document.getElementById("bet").value>parseInt(user.Money)){
            $('#createRaceErrorMesage').html('<div class="alert alert-danger m-2"><strong>Not Enough Money</strong></div>')
            return
        }
        var data = {
            userId:user._id,
            username:user.username,
            Money: user.Money,
            bet: document.getElementById("bet").value,
            body: `${document.getElementById("raceBodyRules").value} | ${document.getElementById("raceBodyWin").value}`,
            maxnum: document.getElementById("maxnum").value
        }
        this.post('/articles/android/add',data,'this.handleRaceCreation')
    },

    handleRaceCreation: function (response) {
        if(response.SERVER_MESSAGE=='Race Created Successfully') this.updateInfo();
        else $('#createRaceErrorMesage').html('<div class="alert alert-danger m-2"><strong>Failed To Create Race</strong></div>');
        
    },

    logout:function () {
        $("#races").fadeOut(500,function(){
            ss.clear(
                function() {
                    $("#VervicalAlignRow").addClass("align-self-center");
                    $("#Login").delay(100).fadeIn(500);
                    $("#logo").delay(100).fadeIn(500);
                },
                function(error) {
                  console.log("Error, " + error);
                }
              );

         });  
    }

};


app.initialize();