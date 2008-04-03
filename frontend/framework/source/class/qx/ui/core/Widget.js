/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.ui.event.WidgetEventHandler)

************************************************************************ */

/**
 * This is the base class for all widgets.
 *
 * A widget consists of at least three HTML elements. The container element,
 * which is
 * added to the parent widget has two child Element: The "decoration" and the
 * "content" element. The decoration element has a lower z-Index and contains
 * markup to render the widget's backround and border using an implementation
 * of {@link qx.ui.decoration.IDecorator}.The cntent element is positioned
 * inside the "container" element to respect paddings and contains the "real"
 * widget element.
 *
 * <pre>
 * -container------------
 * |                    |
 * |  -decoration----   |
 * |  | -content----|-  |
 * |  | |           ||  |
 * |  --|------------|  |
 * |    --------------  |
 * |                    |
 * ----------------------
 * </pre>
 *
 * @appearance widget
 * @state disabled set by {@link #enabled}
 */
qx.Class.define("qx.ui.core.Widget",
{
  extend : qx.ui.core.LayoutItem,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create basic element structure
    this._containerElement = this._createContainerElement();
    this._contentElement = this.__createContentElement();
    this._containerElement.add(this._contentElement);

    // store "weak" reference to the widget in the DOM element.
    this._containerElement.setAttribute("$$widget", this.toHashCode());

    // Initialize states map
    this.__states = {};

    // Add to appearance queue for initial apply of styles
    qx.ui.core.queue.Appearance.add(this);

    // Initialize properties
    this.initFocusable();
    this.initSelectable();

    // Add container listeners
    this._containerElement.addListener("activate", this._onContainerActivate, this);
    this._containerElement.addListener("deactivate", this._onContainerDeactivate, this);
    this._containerElement.addListener("focusin", this._onContainerFocusIn, this);
    this._containerElement.addListener("focusout", this._onContainerFocusOut, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the combination of parent, visibility and layout visibility results into a switch to <code>true</code>. */
    show : "qx.event.type.Event",

    /** Fired when the combination of parent, visibility and layout visibility results into a switch to <code>false</code>. */
    hide : "qx.event.type.Event",

    /** Fired after a visibility/parent change when the widget finally appears on the screen. */
    appear : "qx.event.type.Event",

    /** Fired after a visibility/parent change when the widget finally disappears on the screen. */
    disappear : "qx.event.type.Event",

    /** Fired on resize (after layouting) of the widget. */
    resize : "qx.event.type.Data",

    /** Fired on move (after layouting) of the widget. */
    move : "qx.event.type.Data",

    /** Fired if the mouse curser moves over the widget. */
    mousemove : "qx.ui.event.type.Mouse",

    /**
     * Fired if the mouse curser enters the widget.
     *
     * Note: This event is also dispatched if the widget is disabled!
     */
    mouseover : "qx.ui.event.type.Mouse",

    /**
     * Fired if the mouse curser leaves widget.
     *
     * Note: This event is also dispatched if the widget is disabled!
     */
    mouseout : "qx.ui.event.type.Mouse",

    /** Fired if a mouse button is pressed on the widget. */
    mousedown : "qx.ui.event.type.Mouse",

    /** Fired if a mouse button is released on the widget. */
    mouseup : "qx.ui.event.type.Mouse",

    /** Fired if the widget is clicked using the left mouse button. */
    click : "qx.ui.event.type.Mouse",

    /** Fired if the widget is double clicked using the left mouse button. */
    dblclick : "qx.ui.event.type.Mouse",

    /** Fired if the widget is clicked using the right mouse button. */
    contextmenu : "qx.ui.event.type.Mouse",

    /** Fired if the mouse wheel is used over the widget. */
    mousewheel : "qx.ui.event.type.Mouse",

    /**
     * This event if fired if a keyboard button is released. This event is
     * only fired once if the user keeps the key pressed for a while.
     **/
    keyup : "qx.ui.event.type.KeySequence",

    /**
     * This event if fired if a keyboard button is pushed down. This event is
     * only fired once if the user keeps the key pressed for a while.
     */
    keydown : "qx.ui.event.type.KeySequence",

    /**
     * This event is fired anytime a key is pressed. It will be repeated if
     * the user keeps the key pressed. The pressed key can be determined using
     * {@link qx.ui.event.type.KeySequence#getKeyIdentifier}.
     */
    keypress : "qx.ui.event.type.KeySequence",

    /**
     * This event is fired if the pressed key or keys result in a printable
     * character. Since the character is not necessarily associated with a
     * single physical key press, the event does not have a key identifier
     * getter. This event gets repeated if the user keeps pressing the key(s).
     *
     * The unicode code of the pressed key can be read using
     * {@link qx.ui.event.type.KeyInput#getKeyCode}.
     */
    keyinput : "qx.ui.event.type.KeyInput",

    /**
     * The event is fired when the widget gets focused. Only widgets which are
     * {@link #focusable} receive this event.
     */
    focus : "qx.ui.event.type.Event",

    /**
     * The event is fired when the widget gets blured. Only widgets which are
     * {@link #focusable} receive this event.
     */
    blur : "qx.ui.event.type.Event",

    /**
     * Fired when the widget itself or any child of the widget receive the focus.
     */
    focusin : "qx.ui.event.type.Event",

    /**
     * Fired when the widget itself or any child of the widget lost the focus.
     */
    focusout : "qx.ui.event.type.Event",

    beforedeactivate : "qx.ui.event.type.Event",
    beforeactivate : "qx.ui.event.type.Event",
    activate : "qx.ui.event.type.Event",
    deactivate : "qx.ui.event.type.Event",

    /**
     * Fired is the widget becomes the capturing widget by a call to {@link #capture}.
     */
    capture : "qx.ui.event.type.Event",

    /**
     * Fired is the widget looses the capturing mode by a call to
     * {@link #releaseCapture} or a mouse click.
     */
    losecapture : "qx.ui.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    /** Selected layout of instance {@link qx.ui.layout.Abstract} */
    layout :
    {
      check : "qx.ui.layout.Abstract",
      nullable : true,
      init : null,
      apply : "_applyLayout"
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the user provided minimal width of the widget. If the value is set
     * to <code>null</code> the preferred minimum width of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
     */
    minWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred width of the widget. If the value is set
     * to <code>null</code> the preferred width of the widget's content
     * is used.
     *
     * The widget's computed width may differ from the given width due to
     * widget stretching. Also take a look at the related properties
     * {@link #minWidth} and {@link #maxWidth}.
     */
    width :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal width of the widget. If the value is set
     * to <code>null</code> the preferred maximal width of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #width} and {@link #minWidth}.
     */
    maxWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true

    },


    /**
     * Sets the user provided minimal height of the widget. If the value is set
     * to <code>null</code> the preferred minimal height of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
     */
    minHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred height of the widget. If the value is set
     * to <code>null</code> the preferred height of the widget's content
     * is used.
     *
     * The widget's computed height may differ from the given height due to
     * widget stretching. Also take a look at the related properties
     * {@link #minHeight} and {@link #maxHeight}.
     */
    height :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal height of the widget. If the value is set
     * to <code>null</code> the preferred maximal height of the widget's content
     * is used.
     *
     * Also take a look at the related properties {@link #height} and {@link #minHeight}.
     */
    maxHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },



    /*
    ---------------------------------------------------------------------------
      STRETCHING
    ---------------------------------------------------------------------------
    */

    /** Whether the widget can grow horitontally. */
    allowGrowX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can shrink horitontally. */
    allowShrinkX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can grow vertically. */
    allowGrowY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the widget can shrink vertically. */
    allowShrinkY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Allow growing and shringking in the horizontal direction */
    allowStretchX :
    {
      group : [ "allowGrowX", "allowShrinkX" ],
      mode : "shorthand",
      themeable: true
    },


    /** Allow growing and shringking in the vertical direction */
    allowStretchY :
    {
      group : [ "allowGrowY", "allowShrinkY" ],
      mode : "shorthand",
      themeable: true
    },


    /*
    ---------------------------------------------------------------------------
      PADDING
    ---------------------------------------------------------------------------
    */

    /** Padding of the widget (top) */
    paddingTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      themeable : true
    },


    /**
     * The 'padding' property is a shorthand property for setting 'paddingTop',
     * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left respectively.
     * If there is only one value, it applies to all sides, if there are two or three,
     * the missing values are taken from the opposite side.
     */
    padding :
    {
      group : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
      mode  : "shorthand",
      themeable : true
    },






    /*
    ---------------------------------------------------------------------------
      STYLING PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * The decorator property points to an object, which is responsible
     * for drawing the widget's decoration, e.g. border, background or shadow
     */
    decorator :
    {
      nullable : true,
      init : null,
      apply : "_applyDecorator",
      event : "changeDecorator",
      check : 'value == null || qx.theme.manager.Decoration.getInstance().isDynamic(value) || qx.Class.hasInterface(value.constructor, qx.ui.decoration.IDecorator)',
      themeable : true
    },


    /**
     * The background color the rendered widget.
     */
    backgroundColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBackgroundColor",
      event : "changeBackgroundColor",
      themeable : true
    },


    /**
     * The text color the rendered widget.
     */
    textColor :
    {
      nullable : true,
      init : "inherit",
      check : "Color",
      apply : "_applyTextColor",
      event : "changeTextColor",
      themeable : true,
      inheritable : true
    },


    /** The font property describes how to paint the font on the widget. */
    font :
    {
      nullable : true,
      init : "inherit",
      apply : "_applyFont",
      event : "changeFont",
      themeable : true,
      inheritable : true
    },


    /**
     * Mapping to native style property opacity.
     *
     *  The uniform opacity setting to be applied across an entire object. Behaves like the new CSS-3 Property.
     *  Any values outside the range 0.0 (fully transparent) to 1.0 (fully opaque) will be clamped to this range.
     */
    opacity :
    {
      check : "Number",
      apply : "_applyOpacity",
      themeable : true,
      nullable : true,
      init : null
    },


    /**
     * Mapping to native style property cursor.
     *
     * The name of the cursor to show when the mouse pointer is over the widget.
     * This is any valid CSS2 cursor name defined by W3C.
     *
     * The following values are possible crossbrowser:
     * <ul><li>default</li>
     * <li>crosshair</li>
     * <li>pointer</li>
     * <li>move</li>
     * <li>n-resize</li>
     * <li>ne-resize</li>
     * <li>e-resize</li>
     * <li>se-resize</li>
     * <li>s-resize</li>
     * <li>sw-resize</li>
     * <li>w-resize</li>
     * <li>nw-resize</li>
     * <li>text</li>
     * <li>wait</li>
     * <li>help </li>
     * </ul>
     */
    cursor :
    {
      check : "String",
      apply : "_applyCursor",
      themeable : true,
      inheritable : true,
      nullable : true,
      init : null
    },




    /*
    ---------------------------------------------------------------------------
      MANAGEMENT PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the widget is enabled. Disabled widgets are usually grayed out
     * and do not process user created events. While in the disabled state most
     * user input events are blocked. Only the {@link #mouseover} and
     * {@link #mouseout} events will be dispatched.
     */
    enabled :
    {
      init : "inherit",
      check : "Boolean",
      inheritable : true,
      apply : "_applyEnabled",
      event : "changeEnabled"
    },


    /**
     * Whether the widget is anonymous.
     *
     * Anonymous widgets are ignored in the event hierarchy. This is useful
     * for combined widgets where the internal structure do not have a custom
     * appearance with a different styling from the element around. This is
     * especially true for widgets like checkboxes or buttons where the text
     * or icon are handled synchronously for state changes to the outer widget.
     */
    anonymous :
    {
      init : false,
      check : "Boolean"
    },


    /**
     * Defines the tab index of an widget. If widgets with tab indexes are part
     * of the current focus root these elements are sorted in first priority. Afterwards
     * the sorting continues by rendered position, zIndex and other criteria.
     */
    tabIndex :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyTabIndex"
    },


    /**
     * Whether the widget is focusable e.g. rendering a focus border and visualize
     * as active element.
     *
     * See also {#isTabable} which allows runtime checks for <code>isChecked</code>
     * or other stuff to test whether the widget is reachable via the TAB key.
     */
    focusable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyFocusable"
    },


    /**
     * Whether the widget contains content which may be selected by the user.
     *
     * Normally only useful for forms fields, longer texts/documents, editors, etc.
     */
    selectable :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelectable"
    },


    /**
     * The appearance ID. This ID is used to identify the appearance theme
     * entry to use for this widget. This controls the styling of the element.
     */
    appearance :
    {
      check : "String",
      init : "widget",
      apply : "_applyAppearance",
      event : "changeAppearance"
    }
  },







  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the widget, which contains the given DOM element.
     *
     * @param element {Element} The DOM element to search the widget for.
     * @return {qx.ui.core.Widget} The widget containing the element.
     */
    getWidgetByElement : function(element)
    {
      // in FF 2 the related target of mouse events is sometimes an
      // anonymous div inside of text area, which raise an exception if
      // the parent node is read. This is why the try/catch block is needed.
      try
      {
        while(element)
        {
          var widgetKey = element.$$widget;

          // dereference "weak" reference to the widget.
          if (widgetKey != null) {
            return qx.core.ObjectRegistry.fromHashCode(widgetKey);
          }

          element = element.parentNode;
        }
      } catch(ex) {}

      return null;
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    setLayoutParent : function(parent)
    {
      if (this._parent === parent) {
        return;
      }

      if (this._parent) {
        this._parent.getContentElement().remove(this._containerElement);
      }

      this._parent = parent || null;

      if (this._parent) {
        this._parent.getContentElement().add(this._containerElement);
      }

      this.__toggleDisplay();

      qx.core.Property.refresh(this);
    },


    /**
     * Returns all child widgets of the widget's layout.
     *
     * @return {Widget[]} The child widgets of the widget's layout.
     */
    getLayoutChildren : function()
    {
      var layout = this.getLayout();
      if (layout) {
        return layout.getChildren();
      } else {
        return [];
      }
    },


    // overridden
    updateLayout : function()
    {
      var computed = this.__computedLayout;
      if (computed.height == null || computed.width == null) {
        var hint = this.getSizeHint();
      }

      var height = computed.height != null ? computed.height : hint.height;
      var width = computed.width != null ? computed.width : hint.width;

      this.renderLayout(computed.left || 0, computed.top || 0, width, height);
    },


    // overridden
    renderLayout : function(left, top, width, height)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (left == null || top == null || width == null || height == null)
        {
          this.debug("left: " + left + ", top: " + top + ", width: " + width + ", height: " + height);
          throw new Error("Something went wrong with the layout of " + this.toString() + "!");
        }
      }

      // Cache some often used stuff in local variables
      var computed = this.__computedLayout;
      var container = this._containerElement;
      var content = this._contentElement;
      var pixel = "px";

      // Create data structure for computed layout
      if (!computed) {
        computed = this.__computedLayout = {};
      }

      // Detect location changes
      var locationChange = (left !== computed.left || top !== computed.top);
      if (locationChange)
      {
        computed.left = left;
        computed.top = top;

        container.setStyle("left", left + pixel);
        container.setStyle("top", top + pixel);
      }

      if (!this.__hasGivenHeight && this.hasHeightForWidth())
      {
        // Note: What when other stuff reproduces a reflow here.
        // Is this really correct to just check for null here?
        // Wouldn't it be more stable to re-calculate the
        // heightForWidth and compare it e.g. ignore it when
        // it has the same value than before?

        // Only try once for each layout iteration
        if (this.__computedHeightForWidth != null)
        {
          delete this.__computedHeightForWidth;
        }
        else
        {
          var flowHeight = this.getHeightForWidth(width);
          // this.debug("Height for width " + width + "px: " + height + "px => " + flowHeight + "px");

          if (height !== flowHeight)
          {
            this.__computedHeightForWidth = flowHeight;
            qx.ui.core.queue.Layout.add(this);

            // Fabian thinks this works flawlessly
            return;
          }
        }
      }

      var sizeChange = (width !== computed.width || height !== computed.height);

      // If the current layout is invalid force a relayout even if
      // the size has not changed
      if (sizeChange || !this._hasValidLayout)
      {
        // Compute inner width
        var insets = this.getInsets();

        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;

        // React on size change
        if (sizeChange)
        {
          computed.width = width;
          computed.height = height;

          container.setStyle("width", width + pixel);
          container.setStyle("height", height + pixel);

          content.setStyle("width", innerWidth + pixel);
          content.setStyle("height", innerHeight + pixel);
        }

        content.setStyle("left", insets.left + pixel);
        content.setStyle("top", insets.top + pixel);
        this.updateDecoration(width, height, sizeChange);

        var layout = this.getLayout();
        if (layout && layout.hasChildren()) {
          layout.renderLayout(innerWidth, innerHeight);
        }

        this._hasValidLayout = true;
      }

      // After doing the layout fire change events
      if (sizeChange && this.hasListeners("resize")) {
        this.fireDataEvent("resize", computed);
      }

      if (locationChange && this.hasListeners("move")) {
        this.fireDataEvent("move", computed);
      }
    },


    // overridden
    hasValidLayout : function() {
      return !!this._hasValidLayout;
    },


    // overridden
    invalidateLayoutCache : function()
    {
      // this.debug("Mark widget layout invalid: " + this);
      this._hasValidLayout = false;

      // invalidateLayoutCache cached size hint
      this._sizeHint = null;

      // invalidateLayoutCache layout manager
      var layout = this.getLayout();
      if (layout) {
        layout.invalidateLayoutCache();
      }
    },






    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
    ---------------------------------------------------------------------------
    */

    /**
     * A size hint computes the dimensions of a widget. It returns
     * the the recommended dimensions as well as the min and max dimensions.
     * Existing technical limits are also respected. The min and max values
     * already respect the stretching properties.
     *
     * <h3>Wording</h3>
     * <ul>
     * <li>User value: Value defined by the widget user, using the size properties</li>
     *
     * <li>Technical value: Technical minimum value defined by the widget author
     *     {@link #_getTechnicalLimits}.</li>
     *
     * <li>Layout value: The value computed by {@link #_getContentHint}</li>
     * </ul>
     *
     * <h3>Algorithm</h3>
     * <ul>
     * <li>minSize: If the user min size or the technical min size is not null, the
     *     maximum of both is taken. Otherwise the layout value is used.</li>
     *
     * <li>(preferred) size: If the user value is not null the user value is used,
     *     otherwise the layout value is used.</li>
     *
     * <li>max size: Same as the preferred size.</li>
     * </ul>
     *
     * @type member
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function() {
      return this._sizeHint || this._computeSizeHint();
    },


    /**
     * Internal computition method for size hint.
     *
     * @type member
     * @return {Map} The size hint map.
     */
    _computeSizeHint : function()
    {
      // Start with the user defined values
      var width = this.getWidth();
      var minWidth = this.getMinWidth();
      var maxWidth = this.getMaxWidth();

      var height = this.getHeight();
      var minHeight = this.getMinHeight();
      var maxHeight = this.getMaxHeight();


      // Remember that the height value is determined not by the content hint.
      // If this is the case we can ignore "height for width".
      this.__hasGivenHeight = height != null;

      // Respect height for width
      if (this.__computedHeightForWidth && height == null) {
        height = this.__computedHeightForWidth;
      }


      // Apply technical min size
      var technicalLimits = this._getTechnicalLimits();

      if (technicalLimits.minWidth != null)
      {
        if (minWidth != null) {
          minWidth = Math.max(minWidth, technicalLimits.minWidth);
        } else {
          minWidth = technicalLimits.minWidth;
        }
      }

      if (technicalLimits.minHeight != null)
      {
        if (minHeight != null) {
          minHeight = Math.max(minHeight, technicalLimits.minHeight);
        } else {
          minHeight = technicalLimits.minHeight;
        }
      }


      // Compute min/max when shrinking/growing is disabled
      if (width != null)
      {
        if (!this.getAllowShrinkX()) {
          minWidth = width;
        }

        if (!this.getAllowGrowX()) {
          maxWidth = width;
        }
      }

      if (height != null)
      {
        if (!this.getAllowShrinkY()) {
          minHeight = height;
        }

        if (!this.getAllowGrowY()) {
          maxHeight = height;
        }
      }


      // The content hint is only needed if any of the size hint fields is
      // still null.
      if (width == null || minWidth == null || maxWidth == null || height == null || minHeight == null || maxHeight == null)
      {
        var contentHint = this._getContentHint();

        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom;

        if (width == null) {
          width = contentHint.width + insetX;
        }

        if (height == null) {
          height = contentHint.height + insetY;
        }

        if (minWidth == null)
        {
          if (this.getAllowShrinkX())
          {
            minWidth = insetX;

            if (contentHint.minWidth != null) {
              minWidth += contentHint.minWidth;
            }
          }
          else
          {
            minWidth = width;
          }
        }

        if (minHeight == null)
        {
          if (this.getAllowShrinkY())
          {
            minHeight = insetY;

            if (contentHint.minHeight != null) {
              minHeight += contentHint.minHeight;
            }
          }
          else
          {
            minHeight = height;
          }
        }

        if (maxWidth == null)
        {
          if (this.getAllowGrowX())
          {
            if (contentHint.maxWidth == null) {
              maxWidth = Infinity;
            } else {
              maxWidth = contentHint.maxWidth + insetX
            }
          }
          else
          {
            maxWidth = width;
          }
        }

        if (maxHeight == null)
        {
          if (this.getAllowGrowY())
          {
            if (contentHint.maxHeight == null) {
              maxHeight = Infinity;
            } else {
              maxHeight = contentHint.maxHeight + insetY;
            }
          }
          else
          {
            maxHeight = height;
          }
        }
      }


      // Limit sizes
      width = Math.max(minWidth, Math.min(maxWidth, width));
      height = Math.max(minHeight, Math.min(maxHeight, height));


      // Build size hint and return
      this._sizeHint =
      {
        width : width,
        minWidth : minWidth,
        maxWidth : maxWidth,
        height : height,
        minHeight : minHeight,
        maxHeight : maxHeight
      };

      return this._sizeHint;
    },


    // overridden
    getCachedSizeHint : function() {
      return this._sizeHint || null;
    },


    /**
     * Returns the recommended/natural dimensions of the widget's content.
     *
     * For labels and images this may be their natural size when defined without
     * any dimensions. For containers this may be the recommended size of the
     * underlaying layout manager.
     *
     * Developer note: This can be overwritten by the derived classes to allow
     * a custom handling here.
     *
     * @type member
     * @return {Map}
     */
    _getContentHint : function()
    {
      var layout = this.getLayout();
      if (layout)
      {
        if (layout.hasChildren())
        {
          return layout.getSizeHint();
        }
        else
        {
          return {
            width : 0,
            height : 0
          };
        }
      }
      else
      {
        return {
          width : 100,
          height : 50
        };
      }
    },



    // overridden
    getHeightForWidth : function(width)
    {
      // Prepare insets
      var insets = this.getInsets();

      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;

      // Compute content width
      var contentWidth = width - insetX;

      // Compute height
      var contentHeight = this._getContentHeightForWidth(contentWidth);

      // Computed box height
      var height = contentHeight + insetY;

      return height;
    },


    /**
     * Returns the computed height for the given width.
     *
     * @type member
     * @param width {Integer} Incoming width (as limitation)
     * @return {Integer} Computed height while respecting the given width.
     */
    _getContentHeightForWidth : function(width) {
      // empty
    },


    /**
     * Returns the technical size limits of this widget.
     *
     * Developer note: This method should be overwritten by derived classes
     * to define the minimum width which keeps the widget usable.
     * This may be for example, that at least the icon and 2 characters of a
     * tab view button are viewable etc. The dimension given here is not
     * refinable by the widget users and give the widget author a good
     * way to integrate a hard-coded technical minimum width.
     *
     * @internal
     * @type member
     * @return {Map} Map with <code>minWidth</code> and <code>minHeight</code>.
     *     A value of <code>null</code> means that the widget does not have a
     *     technical min size.
     */
    _getTechnicalLimits : function()
    {
      return {
        minWidth : null,
        minHeight : null
      };
    },





    /*
    ---------------------------------------------------------------------------
      INSET CALCULATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Return the insets of the widget's inner element relative to its
     * container element. The inset is the sum of the padding and border width.
     *
     * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
     *   <code>bottom</code> and <code>left</code>. All values are integers.
     */
    getInsets : function()
    {
      var top = this.getPaddingTop();
      var right = this.getPaddingRight();
      var bottom = this.getPaddingBottom();
      var left = this.getPaddingLeft();

      if (this.__decorator)
      {
        var inset = this.__decorator.getInsets();

        top += inset.top;
        right += inset.right;
        bottom += inset.bottom;
        left += inset.left;
      }

      return {
        "top" : top,
        "right" : right,
        "bottom" : bottom,
        "left" : left
      };
    },





    /*
    ---------------------------------------------------------------------------
      COMPUTED LAYOUT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's computed location and dimension as computed by
     * the layout manager.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The widget location and dimensions in pixel
     *    (if the layout is valid). Contains the keys
     *    <code>width</code>, <code>height</code>, <code>left</code> and
     *    <code>top</code>.
     */
    getComputedLayout : function() {
      return this.__computedLayout || null;
    },


    /**
     * Returns the widget's computed inner dimension as available
     * through the layout process.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The widget inner dimension in pixel (if the layout is
     *    valid). Contains the keys <code>width</code> and <code>height</code>.
     */
    getComputedInnerSize : function()
    {
      var computed = this.__computedLayout;
      if (!computed) {
        return null;
      }

      var insets = this.getInsets();

      // Return map data
      return {
        width : computed.width - insets.left - insets.right,
        height : computed.height - insets.top - insets.bottom
      };
    },





    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT: IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // {Boolean} Whether the layout defined that the widget is visible or not.
    __layoutVisible : true,


    // property apply
    _applyVisibility : function(value, old)
    {
      this.__toggleDisplay();

      // only force a layout update if visibility change from/to "exclude"
      var parent = this._parent;
      if (parent && (old === "excluded" || value === "excluded"))
      {
        var parentLayout = parent.getLayout();
        if (parentLayout) {
          parentLayout.childExcludeModified(this);
        }

        qx.ui.core.queue.Layout.add(parent);
      }
    },


    layoutVisibilityModified : function(value)
    {
      if (value !== this.__layoutVisible)
      {
        if (value) {
          delete this.__layoutVisible;
        } else {
          this.__layoutVisible = false;
        }

        this.__toggleDisplay();
      }
    },


    /**
     * Helper method to handle visibility changes.
     *
     * @type member
     * @return {void}
     */
    __toggleDisplay : function()
    {
      if (this._parent && this.__layoutVisible && this.getVisibility() === "visible")
      {
        this.$$visible = true;

        // Make the element visible (again)
        this._containerElement.show();

        // Prepare for "appear" event
        qx.ui.core.queue.Display.add(this);

        // Fire "show" event
        if (this.hasListeners("show")) {
          this.fireEvent("show");
        }
      }
      else if (this.$$visible)
      {
        delete this.$$visible;

        // On parent removal it gets completely removed from DOM
        // which means we do not need to apply any display styles
        // on it.
        if (this._parent) {
          this._containerElement.hide();
        }

        // Prepare for "disappear" event
        qx.ui.core.queue.Display.add(this);

        // Fire "hide" event
        if (this.hasListeners("hide")) {
          this.fireEvent("hide");
        }
      }
    },






    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT: USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Make this widget visible.
     *
     * @type member
     * @return {void}
     */
    show : function() {
      this.setVisibility("visible");
    },


    /**
     * Hide this widget.
     *
     * @type member
     * @return {void}
     */
    hide : function() {
      this.setVisibility("hidden");
    },


    /**
     * Hide this widget and exclude it from the underlying layout.
     *
     * @type member
     * @return {void}
     */
    exclude : function() {
      this.setVisibility("excluded");
    },


    /**
     * Whether the widget is locally visible.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is visible
     */
    isVisible : function() {
      return !!this.$$visible;
    },


    /**
     * Whether the widget is locally hidden.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is hidden
     */
    isHidden : function() {
      return !this.$$visible;
    },


    /**
     * Whether the widget is locally excluded.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget is excluded
     */
    isExcluded : function() {
      return this.getVisibility() === "excluded";
    },






    /*
    ---------------------------------------------------------------------------
      CREATION OF HTML ELEMENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Create the widget's container HTML element.
     *
     * @return {qx.html.Element} The container HTML element
     */
    _createContainerElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("position", "absolute");
      el.setStyle("zIndex", 0);

      // Omit IE specific dotted outline border
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        el.setAttribute("hideFocus", "true");
      } else {
        el.setStyle("outline", "none");
      }

      return el;
    },


    /**
     * Create the widget's decoration HTML element.
     *
     * @return {qx.html.Element} The decoration HTML element
     */
    __createDecorationElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("zIndex", 5);
      el.setStyle("position", "absolute");
      el.setStyle("left", 0);
      el.setStyle("top", 0);

      return el;
    },


    /**
     * Create the widget's content HTML element.
     *
     * @return {qx.html.Element} The content HTML element
     */
    __createContentElement : function()
    {
      var el = this._createContentElement();

      el.setStyle("position", "absolute");
      el.setStyle("zIndex", 10);

      return el;
    },


    /**
     * Creates the content element. The style properties
     * position and zIndex are modified from the Widget
     * core.
     *
     * This function may be overridden to customize a class
     * content.
     */
    _createContentElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("overflow", "hidden");

      return el;
    },


    /**
     * Returns the element wrapper of the widget's container element.
     * This method exposes widget internal and must be used with caution!
     *
     * @return {qx.html.Element} The widget's container element
     */
    getContainerElement : function() {
      return this._containerElement;
    },


    /**
     * Returns the element wrapper of the widget's content element.
     * This method exposes widget internal and must be used with caution!
     *
     * @return {qx.html.Element} The widget's content element
     */
    getContentElement : function() {
      return this._contentElement;
    },






    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Enables mouse event capturing. All mouse events will dispatched on this
     * widget until capturing is disabled using {@link #releaseCapture} or a
     * mouse button is clicked. If the widgets becomes the capturing widget the
     * {@link #capture} event is fired. Once it looses capture mode the
     * {@link #losecapture} event is fired.
     */
    capture : function() {
      this._containerElement.capture();
    },


    /**
     * Disables mouse capture mode enabled by {@link #capture}.
     */
    releaseCapture : function() {
      this._containerElement.releaseCapture();
    },








    /*
    ---------------------------------------------------------------------------
      DECORATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Update the decoration (background, border, ...)
     *
     * @internal Mainly for decoration queue
     * @param width {Integer} The widget's current width
     * @param height {Integer} The widget's current height
     * @param updateSize {Boolean} Whether the decorator size needs to be updatet.
     */
    updateDecoration : function(width, height, updateSize)
    {
      var updateDecorator = this.__updateDecorator;
      var initDecorator = this.__initDecorator;

      if (this.__decorator)
      {
        this.__decorator.render(
          this._decorationElement,  width, height, this.__backgroundColor,
          initDecorator || updateSize,
          initDecorator || updateDecorator
        );
      }

      if (updateDecorator) {
        delete this.__updateDecorator;
      }

      if (initDecorator) {
        delete this.__initDecorator;
      }
    },


    // property apply
    _applyDecorator : function(value, old) {
      qx.theme.manager.Decoration.getInstance().connect(this._styleDecorator, this, value);
    },


    /**
     * Callback for decoration manager connection
     *
     * @type member
     * @param decorator {qx.ui.decoration.IDecorator} the decorator object
     * @return {void}
     */
    _styleDecorator : function(value)
    {
      // Value life cycle management
      var old = this.__decorator;
      this.__decorator = value;

      // Shorthands
      var container = this._containerElement;
      var decoration = this._decorationElement;

      // Create decoration element on demand
      if (value && !decoration)
      {
        decoration = this._decorationElement = this.__createDecorationElement();
        container.add(decoration);
      }

      // If the new decorator is null, reset the old decorator and apply the
      // background color to the content element
      if (!value)
      {
        if (old) {
          old.reset(decoration);
        }

        if (this.__backgroundColor) {
          container.setStyle("backgroundColor", this.__backgroundColor);
        }
      }

      // If there was no old decorator, remove the background color from the
      // container element and initialize the decorator
      else if (!old)
      {
        this.__initDecorator = true;

        if (this.__backgroundColor) {
          container.removeStyle("backgroundColor");
        }
      }

      // If both have different types reset the old one and initialize the
      // new dcorator
      else if (old.classname !== value.classname)
      {
        this.__initDecorator = true;
        old.reset(decoration);
      }

      // If the class is identical, but the styles where changed.
      else
      {
        this.__updateDecorator = true;
      }

      // Add to layout queue
      qx.ui.core.queue.Layout.add(this);
    },





    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },


    /**
     * Callback for color manager connection
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _styleTextColor : function(color)
    {
      if (color) {
        this._contentElement.setStyle("color", color);
      } else {
        this._contentElement.removeStyle("color");
      }
    },






    /*
    ---------------------------------------------------------------------------
      OTHER PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * generic property apply method for layout relevant properties
     */
    _applyLayoutChange : function() {
      qx.ui.core.queue.Layout.add(this);
    },


    // property apply
    _applyLayout : function(value, old)
    {
      if (value) {
        value.setWidget(this);
      }
    },


    // property apply
    _applyOpacity : function(value, old) {
      this._containerElement.setStyle("opacity", value);
    },


    // property apply
    _applyCursor : function(value, old) {
      this._containerElement.setStyle("cursor", value);
    },


    // property apply
    _applyEnabled : function(value, old)
    {
      if (value===false) {
        this.addState("disabled");
      } else {
        this.removeState("disabled");
      }
    },


    // property apply
    _applyBackgroundColor : function(value) {
      qx.theme.manager.Color.getInstance().connect(this._styleBackgroundColor, this, value);
    },


    /**
     * Callback for color manager connection.
     *
     * If no decorator is set, the background color will be applied to the
     * container element.
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _styleBackgroundColor : function(color)
    {
      this.__backgroundColor = color;

      if (!this.__decorator) {
        this._containerElement.setStyle("backgroundColor", color || null);
      } else {
        qx.ui.core.queue.Layout.add(this);
      }
    },


    // property apply
    _applyFont : function(value, old) {
      // place holder
    },






    /*
    ---------------------------------------------------------------------------
      STATE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Returns whether a state is set.
     *
     * @type member
     * @param state {String} the state to check.
     * @return {Boolean} whether the state is set.
     */
    hasState : function(state) {
      return !!this.__states[state];
    },


    /**
     * Sets a state.
     *
     * @type member
     * @param state {var} TODOC
     * @return {void}
     */
    addState : function(state)
    {
      if (!this.__states[state])
      {
        this.__states[state] = true;
        qx.ui.core.queue.Appearance.add(this);
      }
    },


    /**
     * Clears a state.
     *
     * @type member
     * @param state {String} the state to clear.
     * @return {void}
     */
    removeState : function(state)
    {
      if (this.__states[state])
      {
        delete this.__states[state];
        qx.ui.core.queue.Appearance.add(this);
      }
    },





    /*
    ---------------------------------------------------------------------------
      APPEARANCE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Style multiple themed properties at once by using a property list
     *
     * @type member
     * @param data {Map} a map of property values. The key is the name of the property.
     * @return {Object} this instance.
     * @throws an error if the incoming data field is not a map.
     */
    __styleProperties : function(data)
    {
      var styler = qx.core.Property.$$method.style;
      var unstyler = qx.core.Property.$$method.unstyle;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        for (var prop in data)
        {
          if (!this[styler[prop]]) {
            throw new Error(this.classname + ' has no themeable property "' + prop + '"');
          }
        }
      }

      var undef = "undefined";
      var value;

      for (var prop in data)
      {
        value = data[prop];
        value === undef ? this[unstyler[prop]]() : this[styler[prop]](value);
      }
    },


    /**
     * Renders the appearance using the current widget states.
     *
     * Used exlusively by {qx.ui.core.queue.Appearance}.
     *
     * @internal
     * @type member
     */
    syncAppearance : function()
    {
      var appearance = this.getAppearance();

      if (appearance)
      {
        var props = qx.theme.manager.Appearance.getInstance().styleFrom(appearance, this.__states);

        if (props) {
          this.__styleProperties(props);
        }
      }
    },


    // property apply
    _applyAppearance : function(value, old)
    {
      var manager = qx.theme.manager.Appearance.getInstance();
      var unstyler = qx.core.Property.$$method.unstyle;

      if (value) {
        var newAppearanceProperties = manager.styleFrom(value, this.__states) || {};
      }

      if (old)
      {
        // TODO: This procedure may be problematic when introducing sub-widgets
        var oldAppearanceProperties = manager.styleFrom(old, this.__states) || {};

        var unstyleList = [];
        for (var prop in oldAppearanceProperties)
        {
          if (!newAppearanceProperties || !(prop in newAppearanceProperties)) {
            this[unstyler[prop]]();
          }
        }
      }

      if (newAppearanceProperties) {
        this.__styleProperties(newAppearanceProperties);
      }
    },



    /*
    ---------------------------------------------------------------------------
      WIDGET QUEUE
    ---------------------------------------------------------------------------
    */

    /**
     * This method is called during the flush of the
     * {@link qx.ui.core.queue.Widget widget queue}.
     */
    syncWidget : function() {},



    /*
    ---------------------------------------------------------------------------
      EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the next event target in the parent chain. May
     * also return the widget itself if it is not anonymous.
     *
     * @type member
     * @return {qx.ui.core.Widget} A working event target of this widget.
     *    May be <code>null</code> as well.
     */
    getEventTarget : function()
    {
      var target = this;

      while (target.getAnonymous())
      {
        target = target.getLayoutParent();
        if (!target) {
          return null;
        }
      }

      return target;
    },


    /**
     * Returns the next focus target in the parent chain. May
     * also return the widget itself if it is not anonymous and focusable.
     *
     * @type member
     * @return {qx.ui.core.Widget} A working focus target of this widget.
     *    May be <code>null</code> as well.
     */
    getFocusTarget : function()
    {
      var target = this;

      if (!target.getEnabled()) {
        return null;
      }

      while (target.getAnonymous() || !target.getFocusable())
      {
        target = target.getLayoutParent();
        if (!target || !target.getEnabled()) {
          return null;
        }
      }

      return target;
    },


    /**
     * Whether the widget is reachable by pressing the TAB key.
     *
     * Normally tests for both, the focusable property and a positive or
     * undefined tabIndex property.
     *
     * @type member
     * @return {Boolean}
     */
    isTabable : function() {
      return this.isFocusable() && this.getTabIndex() !== -1;
    },




    // whether the default tabIndex allows focusing the element
    _supportsNativeFocus : false,

    _applyFocusable : function(value)
    {
      var tabIndex = value ? this.getTabIndex() || 1 : null;

      if (tabIndex === -1 && !this._supportsNativeFocus) {
        this._containerElement.removeAttribute("tabIndex", tabIndex);
      } else {
        this._containerElement.setAttribute("tabIndex", tabIndex);
      }
    },

    _applyTabIndex : function(value)
    {
      return;


    },

    _applySelectable : function(value)
    {
      return;

      if (qx.core.Variant.isSet("qx.client", "gecko|webkit")) {
        this._contentElement.setStyle("userSelect", value ? null : "none");
      }

    },





    _onContainerActivate : function(e)
    {
      if (this.getAnonymous() && this.getEnabled()) {
        return;
      }

      e.stopPropagation();

      if (!this.getEnabled()) {
        return;
      }

      this.debug("Activating...");
    },

    _onContainerDeactivate : function(e)
    {
      if (this.getAnonymous() && this.getEnabled()) {
        return;
      }

      e.stopPropagation();

      if (!this.getEnabled()) {
        return;
      }

      this.debug("Deactivating...");
    },

    _onContainerFocusIn : function(e)
    {
      if (this.getAnonymous() && this.getEnabled()) {
        return;
      }

      e.stopPropagation();

      if (!this.getEnabled()) {
        return;
      }

      this.debug("Focusing...");
      this.addState("focused");
    },

    _onContainerFocusOut : function(e)
    {
      if (this.getAnonymous() && this.getEnabled()) {
        return;
      }

      e.stopPropagation();

      if (!this.getEnabled()) {
        return;
      }

      this.debug("Bluring...");
      this.removeState("focused");
    },






    /**
     * Focus this widget.
     */
    focus : function()
    {
      if (this.isFocusable()) {
        this._contentElement.focus();
      } else {
        throw new Error("Widget is not focusable!");
      }
    },


    /**
     * Remove focus from this widget.
     */
    blur : function()
    {
      if (this.isFocusable()) {
        this._contentElement.blur();
      } else {
        throw new Error("Widget is not focusable!");
      }
    },


    /**
     * Activate this widget.
     */
    activate : function() {
      this._containerElement.activate();
    },


    /**
     * Deactivate this widget.
     */
    deactivate : function() {
      this._containerElement.deactivate();
    },







    /*
    ---------------------------------------------------------------------------
      ENHANCED DISPOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Removes this widget from its parent and dispose it.
     *
     * Please note that the widget is not disposed synchronously. The
     * real dispose happens after the next queue flush.
     *
     * @type member
     * @return {void}
     */
    destroy : function()
    {
      var parent = this.getLayoutParent();
      if (parent) {
        parent.remove(this);
      }

      qx.ui.core.queue.Dispose.add(this);
    }
  },


  settings :
  {
    "qx.layoutDebug" : "off"
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // TODO

  }
});
