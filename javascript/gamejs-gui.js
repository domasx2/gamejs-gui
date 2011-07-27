var gamejs = require('gamejs');
var draw=gamejs.draw;

var EVT_FOCUS = exports.EVT_FOCUS = 'focus';
var EVT_BLUR = exports.EVT_BLUR = 'blur';
var EVT_MOUSE_OVER = exports.EVT_MOUSE_OVER = 'mouse_over';
var EVT_MOUSE_OUT = exports.EVT_MOUSE_OUT = 'mouse_out';
var EVT_KEY_DOWN = exports.EVT_KEY_DOWN= gamejs.event.KEY_DOWN;
var EVT_KEY_UP = exports.EVT_KEY_UP = gamejs.event.KEY_UP;
var EVT_MOUSE_UP = exports.EVT_MOUSE_UP = gamejs.event.MOUSE_UP;
var EVT_MOUSE_DOWN = exports.EVT_MOUSE_DOWN = gamejs.event.MOUSE_DOWN;
var EVT_MOUSE_WHEEL = exports.EVT_MOUSE_WHEEL = gamejs.event.MOUSE_WHEEL;
var EVT_MOUSE_MOTION = exports.EVT_MOUSE_MOTION = gamejs.event.MOUSE_MOTION;
var EVT_BTN_CLICK = exports.EVT_BTN_CLICK = 'btn_click';
var EVT_CLOSE = exports.EVT_CLOSE = 'close';
var DEFAULT_FONT_DESCR='14px Verdana';
var gamejs_ui_next_id=1;
/**********************************************
 *cloneEvent
 *
 * evt- event to clone
 * offset [x, y] - substract from events position.
 *
 *
 */
function cloneEvent(evt, offset){
    var new_evt={};
    for(key in evt){
        new_evt[key]=evt[key];
    }
    if(new_evt.pos && offset){
        new_evt.pos=[new_evt.pos[0]-offset[0], new_evt.pos[1]-offset[1]];
    }
    return new_evt; 
}

//returns pos of size2 if to be placed at the center of size1
function getCenterPos(size1, size2){
    return [Math.max(parseInt((size1[0]-size2[0])/2), 0),
            Math.max(parseInt((size1[1]-size2[1])/2), 0)];
}

/*****************************************************
 *CachedFont
 *font cache where each letter is saved as an image. caching is lazy
 *
 *font: {String|Array} - either font description as string, or assoc array character:gamejs.Surface
 *color - color of the font, not required if image array is supplied. defaults to black.
 */
var CachedFont=exports.CachedFont=function(font, color){
    this.space_width=3;
    this.tab_width=12;
    this.chars={}; //character:surface;
    this.font=null;
    if((typeof font)=='string'){
        color = color ? color : '#000';
        this.color=color;
        this.font=new gamejs.font.Font(font);
        
    }else{
        this.chars=font;
        this.font=new gamejs.font.Font(DEFAULT_FONT_DESCR);
        this.color='#000';
    }
    //space width - 1/3 of m's width
    this.space_width=parseInt(Math.ceil(this.getCharSurface('m').getSize()[0]/3));
    this.tab_width=3*this.space_width;
};

CachedFont.prototype.getCharSurface=function(c){
    if(!this.chars[c]){
        var s=this.font.render(c, this.color);
        this.chars[c]=s;
    }
    return this.chars[c];
};

CachedFont.prototype.getTextSize=function(text){
    var w=0, h=0, c, l, sz;
    if(text){ 
        for(var i=0;i<text.length;i++){
            c=text[i];
            if(c==' ')w+=this.space_width;
            else if(c=='\t')w+=this.tab_width;
            else{
                l=this.getCharSurface(c);
                if(l){
                    sz=l.getSize();
                    w+=sz[0];
                    h=Math.max(sz[1], h);
                }
            }
        }
        return [w, h];
    }else return [0, 0];
};

CachedFont.prototype.render=function(surface, text, position){
    ofst=position[0];
    var i, c, s;
    for(i=0;i<text.length;i++){
        c=text[i];
        if(c==' ')ofst+=this.space_width;
        else if(c=='\t')ofst+=this.tab_width;
        else{
            s=this.getCharSurface(c);
            r1=[ofst, position[1]];
            surface.blit(s, r1);
            ofst+=s.getSize()[0];
        }
    }        
    
};


exports.DEFAULT_FONT=new CachedFont('12x Verdana', 'black');

/******************************************************
 *WINDOW
 *
 *contains other windows, handles and despatches events
 *pars:
 *
 *parent - parent window
 *size  [x, y]
 *position [x, y]
 *surface - if provided, this surface is used instead of creating a new one
 */
var Window=exports.Window=function(pars){
    this.type='window';
    this.id=gamejs_ui_next_id++;
    if(!pars.size) throw "Window: size must be specified"
    this.size=pars.size;
    if(!pars.position) throw "Window: position must be specified"
    this.position=pars.position;
    this.surface=pars.surface ? pars.surface : new gamejs.Surface(this.size);
    this.parent=pars.parent;
    if(this.parent) this.parent.addChild(this);
    
    this.children=[];

    //redraw window on next update?
    this.refresh=true;
    
    //is the mouse over this window?
    this.hover=false;
    
    //is this window focused?
    this.focus=false;
    
    //evenet type: [{'callback':x, 'scope':y, ...]
    this.listeners={};
    return this;
    
};

/**
 *remove child. this effectively destroys the child and its children
 *
 *child - Window object or window id
 */
Window.prototype.removeChild=function(child){
    if(typeof(child)!='number')child=child.id;
    for(var i=0;i<this.children.length;i++){
        if(this.children[i].id==child){
            child=this.children.splice(i, 1);
            this.refresh=true;
            return true;
        }
    }
    return false;
}

/**
 *calls parent's removeChild
 */
Window.prototype.destroy=function(){
    if(this.parent)this.parent.removeChild(this);
}

Window.prototype.getRect=function(){
    return new gamejs.Rect(this.position, this.size);  
};

//child windows


Window.prototype.addChild=function(child){
    this.children.push(child);
}

//redraw this window
Window.prototype.draw=function(){
    var painted=false; //has something been repainted in this window?
    //does this window need repainting?
  
    this.children.forEach(function(child){
        //draw children if this window has been repainted or child has been repainted
        if(child.draw() || this.refresh){
            painted=true;
        }
    }, this);
    
    if(this.refresh || painted){
        this.paint();
        this.children.forEach(function(child){
            this.surface.blit(child.surface, child.position);
        }, this)
        painted=true;
        this.refresh=false;
    }
    
    return painted;
};

//actual draw code, override
Window.prototype.paint=function(){}

//update window state
Window.prototype.update=function(msDuration){
    this.children.forEach(function(child){
        child.update(msDuration);        
    });
};

Window.prototype.on=function(event_type, callback, scope){
    if(!this.listeners[event_type])this.listeners[event_type]=[];
    this.listeners[event_type].push({'callback':callback, 'scope':scope});
};

Window.prototype.despatchEventToChildren= function(event){
    this.children.forEach(function(child){child.despatchEvent(event);});
};

/**
 *move window to new position
 */
Window.prototype.move=function(position){
    this.position=position;
    this.parent.refresh=true;
};

/**
 *resize window
 */
Window.prototype.resize=function(size){
    this.size=size;
    this.surface=new gamejs.Surface(size);
    this.refresh=true;
    if(this.parent)this.parent.refresh=true;
}

//despatch events to children, handle them if needed
Window.prototype.despatchEvent=function(event){

    var inside=false; //event position inside this window
    
    if(event.type==EVT_BLUR){
        if(this.focus){
            this.focus=false;
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OUT){
        if(this.hover){
            this.hover=false;
            this.handleEvent(event);
        }
        this.despatchEventToChildren(event);
    }
    else if(event.type==EVT_MOUSE_OVER){
        this.hover=true;
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_FOCUS){
        this.focus=true;
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_DOWN){
        if(!this.focus){
            this.despatchEvent({'type':EVT_FOCUS});
        }
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.focus) child.despatchEvent({'type':EVT_BLUR});
            }
        }, this);
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_UP){
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                child.despatchEvent(cloneEvent(event, child.position));
            }
        }, this);
        this.handleEvent(event);
    }
    
    else if(event.type==EVT_MOUSE_MOTION){
        
        //mouse moved onto this window - hover
        this.children.forEach(function(child){
            //click inside child: despatch
            if(child.getRect().collidePoint(event.pos)){
                //inside, not hovering: hover
                if(!child.hover) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OVER, 'pos':event.pos}, child.position));
                child.despatchEvent(cloneEvent(event, child.position));
            }else{
                //not inside, but child is focused: blur
                if(child.hover) child.despatchEvent(cloneEvent({'type':EVT_MOUSE_OUT, 'pos':event.pos}, child.position));
            }
        }, this);
        this.handleEvent(event);
        
    }
    else if(event.type==EVT_KEY_UP || event.type==EVT_KEY_DOWN || event.type==EVT_KEY_UP){
        if(this.focus){     
            this.children.forEach(function(child){
                if(child.focus) child.despatchEvent(cloneEvent(event));
            });
            this.handleEvent(event);
        }
    //default
    }else{
        this.handleEvent(event);
    }

};

Window.prototype.getGUI=function(){
    var parent=this.parent;
    while(parent!=null && parent.type!='gui'){
        parent=parent.parent;
    }
    return parent;
};

//CAN ONLY BE CALLED BY DESPATCH EVENT!
Window.prototype.handleEvent=function(event){
    if(this.listeners[event.type]){
        this.listeners[event.type].forEach(function(listener){
            if(listener.scope) listener.callback.apply(listener.scope, [event, this]);
            else listener.callback(event, this);
        });
    }
};

/********************************************
 *LABEL
 *pars:
 *parent
 *position
 *text
 *font - CachedFont instance, optional - uses exports.DEFAULT_FONT by default
 *
 *
 *size is set automatically.
 */

var Label=exports.Label=function(pars){
    if(!pars.text) throw 'Label: text parameter is missing.';
    this.font=pars.font;
    pars.size=[1, 1];
    Label.superConstructor.apply(this, [pars]);
    this.setText(pars.text);
    this.type='label';
    
}

gamejs.utils.objects.extend(Label, Window);

Label.prototype.getFont=function(){
    return this.font ? this.font : exports.DEFAULT_FONT;
};

Label.prototype.setText=function(text){
    this.text=text;
    this.size=this.getFont().getTextSize(text);
    this.resize(this.size);
};

Label.prototype.paint=function(){
    this.getFont().render(this.surface, this.text, [0, 0]);
};

/************************************************
 *BUTTON
 *
 *pars:
 *parent
 *position
 *size
 *image
 *text
 *font - CachedFont instance
 */

var Button=exports.Button=function(pars){
    if(!(pars.image ||(pars.text))) throw 'Button: image or text must be provided.';
    Button.superConstructor.apply(this, [pars]);
    this.type='button';
    this.image=null;
    this.label=null;
    if(pars.image){
        var sz=pars.image.getSize();
        var pos=getCenterPos(this.size, sz);
        this.image=new Image({'image':pars.image,
                              'parent':this,
                              'position':pos});
    }
    else if(pars.text){     
        this.label=new Label({'parent':this,
                             'position':[0, 0],
                             'text':pars.text,
                             'font':pars.font});
        this.label.move(getCenterPos(this.size, this.label.size));
    }
    
    this.pressed_down=false;
    this.on(EVT_MOUSE_DOWN, function(){
        if(!this.pressed_down){
            this.pressed_down=true;
            this.refresh=true;
        }
    }, this);
    
    this.on(EVT_MOUSE_UP, function(){
        if(this.pressed_down){
            this.pressed_down=false;
            this.despatchEvent({'type':EVT_BTN_CLICK});
            this.refresh=true;
        }
    }, this);
    
    this.on(EVT_MOUSE_OUT, function(){
        if(this.pressed_down){
            this.pressed_down=false;
            this.refresh=true;
        }
    }, this)
};

gamejs.utils.objects.extend(Button, Window);

Button.prototype.onClick=function(callback, scope){
    this.on(EVT_BTN_CLICK, callback, scope);
};

Button.prototype.paint=function(){
    gamejs.draw.rect(this.surface, this.pressed_down ? '#D3D3D3' : '#FFF', new gamejs.Rect([0, 0], this.size));
    gamejs.draw.rect(this.surface, '#808080', new gamejs.Rect([0, 0], this.size), 1);
    
};

/************************************************
 *IMAGE
 * pars:
 * parent
 * image - gamejs.Surface
 * position
 * size - defaults to image size, if other is set, image is resized
 */

var Image=exports.Image=function(pars){
    if(!pars.image) throw 'Image: parameter image is required';
    size=pars.size;
    if(!size) size=pars.image.getSize();
    this.size=pars.size=size;
    this.image=pars.image;
    if(size[0]!=this.image.getSize()[0] || size[1]!=this.image.getSize()[1]){
        this.surface=new gamejs.Surface(size);
        this.surface.blit(this.image, new gamejs.Rect([0, 0], size), new gamejs.Rect([0, 0], this.image.getSize()));
    }
    else{
        this.surface=this.image;
    }
    pars.surface=this.surface;
    Image.superConstructor.apply(this, [pars]);
    this.type='image';
    return this;
};

Image.prototype.setImage=function(image){
    this.image=image;
    if(this.size[0]!=this.image.getSize()[0] || this.size[1]!=this.image.getSize()[1]){
        this.surface=new gamejs.Surface(this.size);
        this.surface.blit(image, new gamejs.Rect([0, 0], this.size), new gamejs.Rect([0, 0], image.getSize()));
    }
    else{
        this.surface=this.image;
    }
    this.refresh=true;
}

Image.prototype.resize=function(size){
    if(size[0]!=this.image.getSize()[0] || size[1]!=this.image.getSize()[1]){
        this.surface=new gamejs.Surface(size);
        this.surface.blit(image, new gamejs.Rect([0, 0], size), new gamejs.Rect([0, 0], image.getSize()));
    }
    else{
        this.surface=this.image;
    }
    Window.prototype.resize.apply(this, size);
}

gamejs.utils.objects.extend(Image, Window);

/******************************************
 *


/*************************************************
 *FRAMEHEADER
 *pars:
 *parent
 *title
 *
 */
var FrameHeader=exports.FrameHeader=function(pars){
    if(!pars.parent) throw 'FrameHeader: parent parameter is required';
    this.height=20;
    pars.width=pars.parent.size[0];
    pars.size=[pars.width, this.height];
    pars.position=[0, 0];
    
    FrameHeader.superConstructor.apply(this, [pars]);
    
    if(pars.title){
        this.setTitle(pars.title);
    }
    
    if(pars.close_btn){
        var img=new gamejs.Surface([15, 15]);
        gamejs.draw.line(img, '#000', [0, 0], [15, 15], 3);
        gamejs.draw.line(img, '#000', [0, 15], [15, 0], 3);
        img=new Image({'parent':this,
                      'position':[this.size[0]-17, 2],
                      'image':img});
        img.on(EVT_MOUSE_DOWN, function(){
            this.close();
            this.despatchEvent({'type':EVT_CLOSE});
        }, this.parent);
    }
    
    this.type='frameheader';
    this.grab_pos=null;
    this.on(EVT_MOUSE_DOWN, this.grab, this);
    this.getGUI().on(EVT_MOUSE_UP, this.release, this);
    this.getGUI().on(EVT_MOUSE_MOTION, this.onmove, this);
    
    
    
};

gamejs.utils.objects.extend(FrameHeader, Window);

FrameHeader.prototype.setTitle=function(text){
    if(!this.title_label)this.title_label=new Label({'parent':this,
                                                    'position':[0, 0],
                                                    'text':text});
    else this.title_label.setText(text);
    var font=this.title_label.getFont();
    var size=font.getTextSize(text);
    this.title_label.move([font.space_width, Math.max(parseInt(this.height-size[1]))], 0);
}

FrameHeader.prototype.paint=function(){
    gamejs.draw.rect(this.surface, '#C0C0C0', new gamejs.Rect([0, 0], this.size));
};

FrameHeader.prototype.grab=function(event){
    this.grab_pos=event.pos;
};

FrameHeader.prototype.onmove=function(event){
    if(this.grab_pos){
        this.parent.move([event.pos[0]-this.grab_pos[0], event.pos[1]-this.grab_pos[1]]);
    }
};

FrameHeader.prototype.release=function(event){
    this.grab_pos=null;
};

/**************************************************************
 *FRAME
 *Root window, handles gamejs events and despatches them to children
 *
 *pars:
 *gui
 *position
 *size
 *header - {Bool} display header?
 *constrain - {Bool} constrain to visible area?
 *title  - {String} frame title, displayed only if header is on
 *close_btn {Bool} display cross for closing?
 ***************************************************************/
var Frame=exports.Frame=function(pars){
    if(!pars.gui) throw 'Frame: gui parameter is required';
   
    Frame.superConstructor.apply(this, [pars]);
    this.type='frame';
    this.visible=false;
    pars.gui.frames.push(this);
    this.parent=pars.gui;
    
    //header
    this.header=null;
    if(pars.header){
        this.header=new FrameHeader({'parent':this,
                                     'close_btn':pars.close_btn,
                                     'title':pars.title});
    }
    
    //constrain
    this.constrain=pars.constrain;
    return this;
};
gamejs.utils.objects.extend(Frame, Window);

Frame.prototype.paint=function(){
    //fill
    gamejs.draw.rect(this.surface, '#FFF', new gamejs.Rect([0, 0], this.size));
    
    //draw border
    gamejs.draw.rect(this.surface, '#404040', new gamejs.Rect([0, 0], this.size), 1);
};

Frame.prototype.setTitle=function(text){
    if(this.header)this.header.setTitle(text);
}

Frame.prototype.show=function(){
    this.visible=true;
    this.refresh=true;
    this.parent.refresh=true;
    this.parent.moveFrameToTop(this);
};

Frame.prototype.close=function(){
    this.visible=false;
    this.parent.refresh=true;
};

Frame.prototype.move=function(position){
    if(this.constrain){
        if(position[0]<0)position[0]=0;
        if(position[0]>this.parent.size[0]-this.size[0]) position[0]=this.parent.size[0]-this.size[0];
        if(position[1]<0)position[1]=0;
        if(position[1]>this.parent.size[1]-this.size[1]) position[1]=this.parent.size[1]-this.size[1];
    }
    Window.prototype.move.apply(this, [position]);
};



/**
 *calls parent's removeChild
 */
Frame.prototype.destroy=function(){
    if(this.parent)this.parent.removeFrame(this);
}



/**
 *handle gamejs events
 *
 */

/**
 *GUI
 *
 */
var GUI=exports.GUI=function(surface){
    GUI.superConstructor.apply(this, [{'position':[0, 0],
                                      'size':surface.getSize(),
                                      'surface':surface}]);
    this.type='gui';
    this.frames=[];
};

gamejs.utils.objects.extend(GUI, Window);

GUI.prototype.draw=function(){
    var painted=Window.prototype.draw.apply(this, []);
    this.frames.forEach(function(frame){
        if(frame.visible && (frame.draw() || painted)){
            this.surface.blit(frame.surface, frame.position);
        }
    }, this);
};

GUI.prototype.paint=function(){
    gamejs.draw.rect(this.surface, '#FFF', new gamejs.Rect([0, 0], this.size));
};

/*****
 *frame - frame id or object
 *removes this frame, effectively destroying it
 */

GUI.prototype.removeFrame=function(frame){
    if(typeof(frame)!='number')frame=frame.id;
    for(var i=0;i<this.frames.length;i++){
        if(this.frames[i].id==frame){
            frame=this.frames.splice(i, 1);
            this.refresh=true;
            return true;
        }
    }
    return false;
};

GUI.prototype.moveFrameToTop=function(frame){
    for(var i=0;i<this.frames.length;i++){
        var f=this.frames[i];
            if(f.id==frame.id){
            this.frames.splice(i, 1);
            this.frames.push(f);
            this.refresh=true;
        }
    }
};

GUI.prototype.despatchEvent=function(event){
    var i, frame;
    //dispatching mouse events to frames: if event is dispatched to a frame, don't dispatch it anywhere else.
    if(event.type==EVT_MOUSE_DOWN || event.type==EVT_MOUSE_MOTION || event.type==EVT_MOUSE_UP){
        var frame;
        var hit=false;
        var clicked_on=null;
        var moused_on=null;
        var topframe=null;
        for(i=this.frames.length-1; i>=0;i--){
            frame=this.frames[i];
            
            if(frame.visible && frame.getRect().collidePoint(event.pos)){
                frame.despatchEvent(cloneEvent(event, frame.position));
                if(event.type==EVT_MOUSE_DOWN){
                    clicked_on=i;
                }
                else if(event.type==EVT_MOUSE_MOTION){
                    moused_on=i;
                }
                hit=true;
                //mouseout window if mouse is on a frame
                if(frame.focus)topframe=i;
                break;
            }
        }
        
        //blur everything else if clicked on a frame
        if(clicked_on!=null){
            Window.prototype.despatchEvent.apply(this, [{'type':EVT_BLUR}]);
            for(i=0;i<this.frames.length;i++){
                if(i!=clicked_on) this.frames[i].despatchEvent({'type':EVT_BLUR});
            }
        }
         
        //mouseout everyhting else if clicked on a frame
        if(moused_on!=null){
            Window.prototype.despatchEvent.apply(this, [{'type':EVT_MOUSE_OUT}]);
            for(i=0;i<this.frames.length;i++){
                if(i!=moused_on) this.frames[i].despatchEvent({'type':EVT_MOUSE_OUT});
            } 
        }
        
        if(!hit){
            Window.prototype.despatchEvent.apply(this, [event]);
        }
        else{
            Window.prototype.handleEvent.apply(this, [event]);
        }
        
        if(topframe!=null){
            this.moveFrameToTop(this.frames[topframe]);      
        }
        
    }else{
        if(event.type==EVT_BLUR || event.type==EVT_MOUSE_OUT || event.type==EVT_KEY_DOWN || event.type==EVT_KEY_UP){
            this.frames.forEach(function(frame){
                if(frame.visible) frame.despatchEvent(cloneEvent(event, frame.position));
            });  
        }
        Window.prototype.despatchEvent.apply(this, [event]);
    }
};





