var gamejs = require('gamejs');
var GUI=require('./gamejs-gui');

gamejs.preload(['./images/bandit_blue.png']);

gamejs.ready(function() {

    var display = gamejs.display.setMode([800, 600]);
    
    var gui=new GUI.GUI(display)   
  
    var frame1=new GUI.Frame({'gui':gui,
                             'position':[200, 60],
                             'size':[200, 300],
                             'header':true,
                             'constrain':true,
                             'close_btn':true,
                             'title':'Frame 1'});

    
    var scrollable_area=new GUI.ScrollableWindow({'position':[0, 20],
                                                 'size':[frame1.size[0]-20,
                                                         frame1.size[1]-20],
                                                 'parent':frame1});
    
    new GUI.Image({'parent':scrollable_area,
                          'position':[10, 30],
                          'image':gamejs.image.load('./images/bandit_blue.png')});
    
    
    new GUI.Label({'parent':scrollable_area,
                  'position':[10, 160],
                  'text':'Enter something else:'});
    
    new GUI.TextInput({'parent':scrollable_area,
                      'position':[10, 190],
                      'size':[100, 20],
                      'text':'boo'});
    
    new GUI.Image({'parent':scrollable_area,
                    'position':[10, 300],
                    'image':gamejs.image.load('./images/bandit_blue.png')});
    
    var scrollbar=new GUI.VerticalScrollbar({'parent':frame1,
                                            'size':[20, frame1.size[1]-20],
                                            'position':[frame1.size[0]-20, 20]});
    
    scrollable_area.setVerticalScrollbar(scrollbar);
    scrollable_area.autoSetScrollableArea();
    
    var frame2=new GUI.Frame({'gui':gui,
                             'position':[210, 85],
                             'size':[200, 200],
                             'header':true,
                             'constrain':true,
                             'close_btn':true,
                             'title':'Frame 2'});
    
    new GUI.Label({'parent':frame2,
                  'position':[5, 50],
                  'text':'Its working!'});
    
    
    
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
    
    var dialog=new GUI.Dialog({'gui':gui,
                               'size':[400, 100]});
    
    var dialog_ok=new GUI.Button({'parent':dialog,
                                 'position':[0, 0],
                                 'size':[100, 30],
                                 'text':'Close'});
    dialog.center(dialog_ok);

    dialog_ok.move([dialog_ok.position[0], dialog_ok.position[1]+20]);
    
    var lbl= new GUI.Label({'parent':dialog,
                  'position':[0, 0],
                  'text':'This is a dialog!'});
    dialog.center(lbl);
    lbl.move([lbl.position[0], lbl.position[1]-20]);
    
    dialog_ok.onClick(function(){
        this.close();
    }, dialog);
    
    var btn4=new GUI.Button({'parent':frame2,
                            'position':[10, 130],
                            'size':[100,30],
                            'text':'Show dialog'});
    btn4.onClick(function(){
        this.show();
    }, dialog);
    
    
    new GUI.Label({'parent':gui,
                  'position':[50, 160],
                  'text':'Enter something:'});
    
    var textinput=new GUI.TextInput({'parent':gui,
                                        'position':[50, 180],
                                        'size':[100, 20],
                                        'text':'hai'});
    
    function tick(msDuration) {
        var events=gamejs.event.get().forEach(function(event) {
            gui.despatchEvent(event);
        });
        gamejs.draw.rect(display, '#FFF', new gamejs.Rect([0, 0], display.getSize()));
        gui.update(msDuration);   
        gui.draw(true);
    };
    
    gamejs.time.fpsCallback(tick, this, 60);
    
});
