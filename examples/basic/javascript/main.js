var gamejs = require('gamejs');
var GUI=require('gamejs-gui');

gamejs.preload(['./images/bandit_blue.png']);


var sometext=" Typography is often a deciding factor in the success of a design. Its importance cannot be overstated. Effective typography can be achieved in so many different ways, as demonstrated in the 17 different categories below.\nSome of the most common ways to treat type is with size, color variation, creative illustrations, and use of textures. The examples below are just the tip of the iceberg as far as the possibilities for type.\nDon't be afraid to flip it, color it, resize it, draw it, or even design your own.\nCheck out these fantastic 101 examples of beautiful text treatments and please let us know of any other great examples we may have missed.";

gamejs.ready(function() {

    //initialize display
    var display = gamejs.display.setMode([800, 600]);
    
    
    //create base GUI object
    var gui=new GUI.GUI(display)   
  
    //create 1st frame
    var frame1=new GUI.Frame({'parent':gui,
                             'position':[200, 60],
                             'size':[200, 300],
                             'constrain':true});
    
    //create header for 1st frame
    new GUI.FrameHeader({'parent':frame1,
                        'close_btn':true,
                        'title':'First frame'});

    
    //create scrollable view for 1st frame
    var scrollable_area=new GUI.ScrollableView({'position':[0, 20],
                                                 'size':[frame1.size[0]-20,
                                                         frame1.size[1]-20],
                                                 'parent':frame1});
    
    //ad an image to this scrollable view
    new GUI.Image({'parent':scrollable_area,
                          'position':[10, 30],
                          'image':gamejs.image.load('./images/bandit_blue.png')});
    
    //and a label
    new GUI.Label({'parent':scrollable_area,
                  'position':[10, 160],
                  'text':'Enter something else:'});
    
    //and a text input
    new GUI.TextInput({'parent':scrollable_area,
                      'position':[10, 190],
                      'size':[100, 20],
                      'text':'boo'});
    
    //and some text
    new GUI.Text({'parent':scrollable_area,
                  'position':[2, 230],
                  'width':frame1.size[0]-20-2,
                  'text':sometext,
                  'justify':true});
                  
                  
    //create a scrollbar
    var scrollbar=new GUI.VerticalScrollbar({'parent':frame1,
                                            'size':[20, frame1.size[1]-20],
                                            'position':[frame1.size[0]-20, 20]});
    
    //set it to scrollable view
    scrollable_area.setVerticalScrollbar(scrollbar);
    //calc scrollable area of the view
    scrollable_area.autoSetScrollableArea();
    
    
    //create second frame
    var frame2=new GUI.Frame({'parent':gui,
                             'position':[210, 85],
                             'size':[200, 200],
                             'constrain':true});
    
    //create header for second frame
    new GUI.FrameHeader({'parent':frame2,
                        'close_btn':true,
                        'title':'First frame'});
    
    //add a label to 2-nd frame
    new GUI.Label({'parent':frame2,
                  'position':[5, 50],
                  'text':'Its working!'});
    
    //add a button to 2nd frame
    var btn3=new GUI.Button({'parent':frame2,
                            'position':[10, 90],
                            'size':[100, 30],
                            'text':'Close all frames'});
    
    btn3.onClick(function(){
        gui.frames.forEach(function(frame){frame.close();});  
    }, gui);
    
    
    
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
    
    
    btn2.onClick(function(){
        this.show();
    }, frame2);
    
    var dialog=new GUI.Dialog({'parent':gui,
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
    
    var text=new GUI.Text({'position':[200, 100],
                          'width':300,
                          'parent':gui,
                          'text':sometext});
    
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
