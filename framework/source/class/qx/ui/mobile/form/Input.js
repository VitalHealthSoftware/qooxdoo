/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Abstract class for all input fields.
 */
qx.Class.define("qx.ui.mobile.form.Input",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.form.MForm,
    qx.ui.form.MModelProperty,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IModel
  ],
  type : "abstract",


  construct : function()
  {
    this.base(arguments);
    this._setAttribute("type", this._getType());
    this.addCssClass("gap");

    this.addListener("focus", this._onSelected, this);
  },


  members :
  {
    // overridden
    _getTagName : function()
    {
      return "input";
    },


    /**
     * Returns the type of the input field. Override this method in the
     * specialized input class.
     */
    _getType : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    /**
    * Returns the parent scroll container of this widget.
    * @return {qx.ui.mobile.container.Scroll} the parent scroll container or <code>null</code>
    */
    __getScrollContainer : function() {
      var scroll = this;
      while (!(scroll instanceof qx.ui.mobile.container.Scroll)) {
        if (scroll.getLayoutParent) {
          var layoutParent = scroll.getLayoutParent();
          if (layoutParent == null || layoutParent instanceof qx.ui.mobile.core.Root) {
            return null;
          }
          scroll = layoutParent;
        } else {
          return null;
        }
      }
      return scroll;
    },


    /**
     * Handles the <code>click</code> and <code>focus</code> event on this input widget.
     * @param evt {qx.event.type.Event} <code>click</code> or <code>focus</code> event
     */
    _onSelected : function(evt) {
      if (!(evt.getTarget() instanceof qx.ui.mobile.form.TextField) && !(evt.getTarget() instanceof qx.ui.mobile.form.NumberField)) {
        return;
      }

      var scrollContainer = this.__getScrollContainer();
      if(scrollContainer === null) {
        return;
      }

      if (qx.core.Environment.get("os.name") == "ios") {
        scrollContainer.scrollToWidget(this.getLayoutParent(), 0);
      } else {
        setTimeout(function() {
          scrollContainer.scrollToWidget(this.getLayoutParent(), 0);

          if (qx.core.Environment.get("os.name") == "android") {
            var old = this._getCaretPosition();
            window.getSelection().empty();

            setTimeout(function() {
              this._setCaretPosition(old);
            }.bind(this), 50);
          }

        }.bind(this), 0);
      }
    }
  },


  destruct : function() {
    this.removeListener("focus", this._onSelected, this);
  }
});
