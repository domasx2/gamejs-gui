var gamejs = require('gamejs');
var GUI=require('gamejs-gui');

gamejs.preload(['./images/bandit_blue.png']);

gamejs.ready(function() {

    var display = gamejs.display.setMode([600, 400]);
    
    var gui=new GUI.GUI(display)   
  
    var frame1=new GUI.Frame({'gui':gui,
                             'position':[200, 60],
                             'size':[100, 300],
                             'header':true,
                             'constrain':true,
                             'close_btn':true,
                             'title':'Frame 1'});
    
    var frame2=new GUI.Frame({'gui':gui,
                             'position':[205, 85],
                             'size':[200, 200],
                             'header':true,
                             'constrain':true,
                             'close_btn':true,
                             'title':'Frame 2'});
    
    new GUI.Label({'parent':frame2,
                  'position':[5, 50],
                  'text':'Its working!'});
    
    var img=new GUI.Image({'parent':frame1,
                          'position':[10, 30],
                          'image':gamejs.image.load('./images/bandit_blue.png')});
    
    new GUI.Label({'parent':gui,
                'position':[50, 50],
                'text':'testing gamejs-gui!',
                'font':new GUI.CachedFont('20px Tahoma', '#0026FF')})
    
    var btn1=new GUI.Button({'parent':gui,
                            'position':[50, 80],
                            'size':[100, 30],
                            'text':'Show frame 1'});
    btn1.onClick(function(){
        this.show();
    }, frame1);
    
    var btn2=new GUI.Button({'parent':gui,
                            'position':[50, 120],
                            'size':[100, 30],
                            'text':'Show frame 2'});
    
    var btn3=new GUI.Button({'parent':frame2,
                            'position':[10, 90],
                            'size':[100, 30],
                            'text':'Close all frames'});
    btn3.onClick(function(){
        gui.frames.forEach(function(frame){frame.close();});  
    }, gui);
    btn2.onClick(function(){
        this.show();
    }, frame2);
    
    function tick(msDuration) {
        var events=gamejs.event.get().forEach(function(event) {
            gui.despatchEvent(event);
        });
        gui.update(msDuration);
        gui.draw();
    };
    
    gamejs.time.fpsCallback(tick, this, 60);
    
});
