define("app/util", {
    guid: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var t = Math.random() * 16 | 0,
                n = e == "x" ? t : t & 3 | 8;
            return n.toString(16)
        })
    },
    getId: function (e) {
        return typeof e.__guid == "undefined" && (e.__guid = this.guid()), e.__guid
    }
}), define("app/eventmanager", ["app/util"], function (e) {
    var t = {};
    return {
        init: function () {
            t = {}
        },
        getListeners: function (e) {
            var n = t[e];
            return n == null && (n = t[e] = []), n
        },
        bind: function (t, n, r) {
            var i = r != null ? e.getId(r) : null;
            this.getListeners(t).push({
                callback: n,
                binderId: i
            })
        },
        unbind: function (t, n, r) {
            var i = this.getListeners(t);
            if (n != null || r != null)
                for (var s = 0, o = i.length; s < o; s++) {
                    var u = i[s];
                    if ((n == null || u.binderId == e.getId(n)) && (r == null || r == u.callback)) {
                        i.splice(s, 1);
                        return
                    }
                } else i.length = 0
        },
        trigger: function (e, t) {
            var n = this.getListeners(e);
            for (var r = 0, i = n.length; r < i; r++) n[r].callback.apply(window, t)
        }
    }
}), define("app/analytics", ["app/eventmanager"], function (e) {
    function t(e) {
        i && ga("send", "event", "pageView", e)
    }

    function n(e, t, n) {
        i && (n = n || (new Date).getTime() - window.performance.timing.domComplete, ga("send", "timing", e, identifier, n))
    }

    function r(e, t, n) {
        i && ga("send", "event", e, t, n)
    }
    var i = !1;
    return {
        init: function () {
            require(["google-analytics"], function (t) {
                if (!i) try {
//                    t("create", "UA-41314886-2", "doublespeakgames.com"), t("send", "pageview"), i = !0
                } catch (n) {
//                    console.log("Failed to initialize Google Analytics: " + n.message)
                }
                if (i) {
                    var s = require("app/gamestate");
                    e.bind("newGame", function () {
                        r("game", "new")
                    }), e.bind("dayBreak", function (e) {
                        r("daybreak", e, e)
                    }), e.bind("dudeDeath", function (e) {
                        r("death", e, s.dayNumber)
                    }), e.bind("buildingComplete", function (e) {
                        r("build", e.options.type.className, s.dayNumber)
                    }), e.bind("gameOver", function () {
                        r("game", "complete", s.dayNumber)
                    }), e.bind("levelUp", function (e) {
                        r("levelup", e, s.dayNumber)
                    }), e.bind("click", function (e) {
                        r("click", e)
                    }), e.bind("prestige", function () {
                        r("game", "prestige")
                    }), e.bind("keySequenceComplete", function () {
                        r("game", "codeEntered")
                    })
                }
            })
        }
    }
}), define("app/textStore", [], function () {
    var e = function (e) {
        var t = this;
        e = e || "en", require(["app/locale/" + e], function (e) {
            t.locale = e
        })
    };
    return e.prototype.get = function (e) {
        return this.locale[e]
    }, e.prototype.isReady = function () {
        return this.locale != null
    }, e
}), define("app/gameoptions", ["jquery"], function (e) {
    var t = {
            musicVolume: 1,
            effectsVolume: 1,
            casualMode: !1
        },
        n = {
            get: function (e, n) {
                return t[e] == null ? n : t[e]
            },
            set: function (e, n) {
                return t[e] = n, typeof Storage != "undefined" && localStorage && (localStorage.gameOptions = JSON.stringify(t)), n
            },
            load: function () {
                try {
                    var n = JSON.parse(localStorage.gameOptions);
                    n && e.extend(t, n)
                } catch (r) {}
            }
        };
    return n
}), define("app/entity/entity", ["jquery"], function (e) {
    var t = function (t) {
        this.options = e.extend({
            className: "blank",
            animationFrames: 4,
            speed: 40
        }, t), this.frame = 0, this.animationRow = 0, this.tempAnimation = null, this.stepFunction = null
    };
    return t.prototype.guid = function () {
        return this._guid || (this._guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var t = Math.random() * 16 | 0,
                n = e == "x" ? t : t & 3 | 8;
            return n.toString(16)
        })), this._guid
    }, t.prototype.el = function () {
        if (this._el == null) {
            var e = require("app/graphics/graphics");
            this._el = e.make(this.options.className)
        }
        return this._el
    }, t.prototype.width = function () {
        return this._width || (this._width = this.el().width()), this._width
    }, t.prototype.height = function () {
        return this._height || (this._height = this.el().height()), this._height
    }, t.prototype.p = function (e) {
        return e != null && (this._position = e), this._position
    }, t.prototype.destroy = function () {
        this.destroyed = !0, Events.trigger(this, "EntityDestroyed")
    }, t.prototype.animate = function () {
        ++this.frame >= this.options.animationFrames && (this.frame = 0, this.tempAnimation != null && (this.tempAnimation = null, this.stepFunction = null));
        var e = require("app/graphics/graphics");
        e.updateSprite(this)
    }, t.prototype.animation = function (e, t, n) {
        t && (this.tempAnimation = null, this.stepFunction = null), n && (this.stepFunction = n), this.animationRow = e, this.frame = 0;
        var r = require("app/graphics/graphics");
        r.updateSprite(this)
    }, t.prototype.animationOnce = function (e, t) {
        this.tempAnimation = e, this.frame = 0;
        var n = require("app/graphics/graphics");
        this.stepFunction = t || null, n.updateSprite(this)
    }, t.prototype.speed = function () {
        return this.options.speed
    }, t
}), define("app/gamecontent", {
    ResourceType: {
        Grain: {
            "char": "g",
            className: "grain",
            dragonEffect: "WingBuffet",
            nightEffect: {
                castle: "spawn:demon",
                fort: "spawn:earthElemental",
                house: "spawn:hauntedArmour",
                "default": "spawn:zombie"
            },
            multipliers: {
                house: 2,
                fort: 3,
                castle: 4
            },
            effectDest: {
                day: [-20, 10],
                night: "side"
            }
        },
        Wood: {
            "char": "w",
            className: "wood",
            nightEffect: {
                "default": "shield"
            },
            multipliers: {
                sawmill: 1,
                sawmill2: 1,
                sawmill3: 2,
                sawmill4: 2,
                sawmill5: 2,
                sawmill6: 3,
                sawmill7: 3,
                sawmill8: 3
            },
            effectDest: {
                day: [32, -20],
                night: [-20, -15]
            }
        },
        Stone: {
            "char": "s",
            className: "stone",
            nightEffect: {
                "default": "sword"
            },
            multipliers: {
                blacksmith: 1,
                blacksmith2: 1,
                blacksmith3: 2,
                blacksmith4: 2,
                blacksmith5: 2,
                blacksmith6: 3,
                blacksmith7: 3,
                blacksmith8: 3
            },
            effectDest: {
                day: [32, -20],
                night: "sword"
            }
        },
        Clay: {
            "char": "c",
            className: "clay",
            dragonEffect: "IceBeam",
            nightEffect: {
                bricklayer4: "spawn:imp",
                bricklayer3: "spawn:waterElemental",
                bricklayer2: "spawn:spider",
                "default": "spawn:rat"
            },
            multipliers: {
                bricklayer: 1,
                bricklayer2: 2,
                bricklayer3: 3,
                bricklayer4: 4
            },
            effectDest: {
                day: [32, -20],
                night: "side"
            }
        },
        Cloth: {
            "char": "l",
            className: "cloth",
            dragonEffect: "FireBlast",
            nightEffect: {
                weaver4: "spawn:warlock",
                weaver3: "spawn:fireElemental",
                weaver2: "spawn:lizardman",
                "default": "spawn:skeleton"
            },
            multipliers: {
                weaver: 1,
                weaver2: 2,
                weaver3: 3,
                weaver4: 4
            },
            effectDest: {
                day: [32, -20],
                night: "side"
            }
        },
        Mana: {
            "char": "m",
            className: "mana",
            nightEffect: {
                "default": "spawn:lich"
            },
            multipliers: {},
            effectDest: {
                day: [30, 505],
                night: "side"
            }
        }
    },
    BuildingCallbacks: {
        shack: function () {
            var e = require("app/eventmanager");
            e.trigger("resourceStoreChanged", [3, 3])
        },
        house: function () {
            var e = require("app/eventmanager");
            e.trigger("resourceStoreChanged", [4, 3])
        },
        fort: function () {
            var e = require("app/eventmanager");
            e.trigger("resourceStoreChanged", [4, 4])
        },
        castle: function () {
            var e = require("app/eventmanager");
            e.trigger("resourceStoreChanged", [5, 4])
        },
        tower: function () {
            var e = require("app/eventmanager");
            e.trigger("enableMagic")
        }
    },
    BuildingType: {
        Shack: {
            className: "shack",
            spriteName: "shack",
            position: 30,
            cost: {},
            requiredLevel: 1,
            animationFrames: 1,
            priority: 1,
            isBase: !0
        },
        House: {
            className: "house",
            spriteName: "shack",
            position: 30,
            cost: {},
            requiredLevel: 4,
            prestigeDependency: "blacksmith",
            animationFrames: 1,
            tileMod: "grain",
            tileLevel: 2,
            replaces: "shack",
            defaultAnimation: 1,
            priority: 1,
            isBase: !0
        },
        Fort: {
            className: "fort",
            spriteName: "shack",
            position: 30,
            cost: {},
            requiredLevel: 7,
            prestigeDependency: "blacksmith3",
            animationFrames: 1,
            tileMod: "grain",
            tileLevel: 3,
            replaces: "house",
            defaultAnimation: 2,
            priority: 1,
            isBase: !0
        },
        Castle: {
            className: "castle",
            spriteName: "shack",
            position: 30,
            cost: {},
            requiredLevel: 10,
            prestigeDependency: "blacksmith6",
            animationFrames: 1,
            tileMod: "grain",
            tileLevel: 4,
            replaces: "fort",
            defaultAnimation: 3,
            priority: 1,
            isBase: !0
        },
        BrickLayer: {
            className: "bricklayer",
            spriteName: "bricklayer",
            position: 90,
            cost: {
                stone: 5,
                wood: 5
            },
            requiredLevel: 1,
            priority: 1
        },
        Bricklayer2: {
            className: "bricklayer2",
            spriteName: "bricklayer",
            position: 90,
            cost: {
                stone: 3,
                wood: 3,
                cloth: 3
            },
            requiredLevel: 1,
            tileMod: "clay",
            tileLevel: 2,
            replaces: "bricklayer",
            defaultAnimation: 1,
            priority: 4
        },
        Bricklayer3: {
            className: "bricklayer3",
            spriteName: "bricklayer",
            position: 90,
            cost: {
                stone: 5,
                wood: 5,
                cloth: 5
            },
            requiredLevel: 1,
            tileMod: "clay",
            tileLevel: 3,
            replaces: "bricklayer2",
            defaultAnimation: 2,
            priority: 6
        },
        Bricklayer4: {
            className: "bricklayer4",
            spriteName: "bricklayer",
            position: 90,
            cost: {
                stone: 8,
                wood: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "clay",
            tileLevel: 4,
            replaces: "bricklayer3",
            defaultAnimation: 3,
            priority: 9
        },
        Weaver: {
            className: "weaver",
            spriteName: "weaver",
            position: 150,
            cost: {
                stone: 5,
                wood: 5
            },
            requiredLevel: 1,
            priority: 2
        },
        Weaver2: {
            className: "weaver2",
            spriteName: "weaver",
            position: 150,
            cost: {
                wood: 3,
                stone: 3,
                clay: 3
            },
            requiredLevel: 1,
            tileMod: "cloth",
            tileLevel: 2,
            replaces: "weaver",
            defaultAnimation: 1,
            priority: 4
        },
        Weaver3: {
            className: "weaver3",
            spriteName: "weaver",
            position: 150,
            cost: {
                wood: 5,
                stone: 5,
                clay: 5
            },
            requiredLevel: 1,
            tileMod: "cloth",
            tileLevel: 3,
            replaces: "weaver2",
            defaultAnimation: 2,
            priority: 6
        },
        Weaver4: {
            className: "weaver4",
            spriteName: "weaver",
            position: 150,
            cost: {
                wood: 8,
                stone: 8,
                clay: 8
            },
            requiredLevel: 1,
            tileMod: "cloth",
            tileLevel: 4,
            replaces: "weaver3",
            defaultAnimation: 3,
            priority: 9
        },
        Blacksmith: {
            className: "blacksmith",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 2,
                clay: 2
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 2,
            priority: 3
        },
        Blacksmith2: {
            className: "blacksmith2",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 2,
                clay: 5,
                cloth: 5
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 3,
            replaces: "blacksmith",
            defaultAnimation: 1,
            priority: 5
        },
        Blacksmith3: {
            className: "blacksmith3",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 2,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 4,
            replaces: "blacksmith2",
            defaultAnimation: 2,
            priority: 6
        },
        Blacksmith4: {
            className: "blacksmith4",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 4,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 5,
            replaces: "blacksmith3",
            defaultAnimation: 3,
            priority: 7
        },
        Blacksmith5: {
            className: "blacksmith5",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 6,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 6,
            replaces: "blacksmith4",
            defaultAnimation: 4,
            priority: 8
        },
        Blacksmith6: {
            className: "blacksmith6",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 6,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 7,
            replaces: "blacksmith5",
            defaultAnimation: 5,
            priority: 9
        },
        Blacksmith7: {
            className: "blacksmith7",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 8,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 8,
            replaces: "blacksmith6",
            defaultAnimation: 6,
            priority: 10
        },
        Blacksmith8: {
            className: "blacksmith8",
            spriteName: "blacksmith",
            position: 210,
            cost: {
                wood: 10,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "stone",
            tileLevel: 9,
            replaces: "blacksmith7",
            defaultAnimation: 7,
            priority: 11
        },
        Sawmill: {
            className: "sawmill",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 2,
                cloth: 2
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 2,
            priority: 3
        },
        Sawmill2: {
            className: "sawmill2",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 2,
                clay: 5,
                cloth: 5
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 3,
            replaces: "sawmill",
            defaultAnimation: 1,
            priority: 5
        },
        Sawmill3: {
            className: "sawmill3",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 2,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 4,
            replaces: "sawmill2",
            defaultAnimation: 2,
            priority: 6
        },
        Sawmill4: {
            className: "sawmill4",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 4,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 5,
            replaces: "sawmill3",
            defaultAnimation: 3,
            priority: 7
        },
        Sawmill5: {
            className: "sawmill5",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 6,
                clay: 8,
                cloth: 8
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 6,
            replaces: "sawmill4",
            defaultAnimation: 4,
            priority: 8
        },
        Sawmill6: {
            className: "sawmill6",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 6,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 7,
            replaces: "sawmill5",
            defaultAnimation: 5,
            priority: 9
        },
        Sawmill7: {
            className: "sawmill7",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 8,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 8,
            replaces: "sawmill6",
            defaultAnimation: 6,
            priority: 10
        },
        Sawmill8: {
            className: "sawmill8",
            spriteName: "sawmill",
            position: 270,
            cost: {
                stone: 10,
                clay: 10,
                cloth: 10
            },
            requiredLevel: 1,
            tileMod: "wood",
            tileLevel: 9,
            replaces: "sawmill7",
            defaultAnimation: 7,
            priority: 11
        },
        Tower: {
            className: "tower",
            spriteName: "tower",
            position: 330,
            cost: {},
            requiredLevel: 1,
            priority: 1,
            test: function (e) {
                return e.gem >= 4
            }
        }
    },
    LootType: {
        healthPotion: {
            onUse: function () {
                var e = require("app/eventmanager"),
                    t = require("app/gamestate");
                e.trigger("healDude", [Math.floor(t.maxHealth() / 2)]), e.trigger("heal")
            }
        },
        manaPotion: {
            onUse: function () {
                var e = require("app/eventmanager"),
                    t = require("app/gamestate");
                e.trigger("gainMana", [Math.floor(t.maxMana() / 2)])
            }
        },
        bomb: {
            onUse: function () {
                var e = require("app/eventmanager");
                e.trigger("damageAll", [20]), e.trigger("bomb")
            }
        },
        equipment: {
            onUse: function () {
                var e = require("app/eventmanager");
                e.trigger("fillEquipment")
            }
        },
        callDragon: {
            large: !0,
            onUse: function () {
                require("app/eventmanager").trigger("callDragon")
            }
        }
    },
    lootPools: {
        rare: ["bomb"],
        uncommon: ["equipment"],
        common: ["healthPotion"]
    },
    StateEffects: {
        freezeTime: {
            className: "freezeTime",
            duration: 15e3
        },
        haste: {
            className: "haste",
            duration: 3e4
        },
        frozen: {
            className: "frozen",
            duration: 8e3,
            start: function (e) {
                e.paused = !0, this._worldEffect == null && (this._worldEffect = new(require("app/entity/worldeffect"))({
                    effectClass: "iceBlock",
                    spriteName: "dragoneffects"
                }), this._worldEffect.p(e.p()), require("app/eventmanager").trigger("newEntity", [this._worldEffect]))
            },
            end: function (e) {
                e.paused = !1, require("app/eventmanager").trigger("removeEntity", [this._worldEffect]), this._worldEffect = null
            }
        }
    },
    Spells: {
        resetBoard: {
            onUse: function () {
                var e = require("app/eventmanager");
                e.trigger("refreshBoard"), e.trigger("refreshBoardSpell")
            }
        },
        haste: {
            onUse: function () {
                var e = require("app/eventmanager"),
                    t = require("app/gamecontent");
                e.trigger("newStateEffect", [t.StateEffects.haste]), e.trigger("haste")
            }
        },
        phaseChange: {
            onUse: function () {
                var e = require("app/eventmanager");
                e.trigger("phaseChange", [!require("app/engine").isNight()]), e.trigger("phaseChangeSpell")
            }
        },
        freezeTime: {
            onUse: function () {
                var e = require("app/eventmanager"),
                    t = require("app/gamecontent");
                e.trigger("newStateEffect", [t.StateEffects.freezeTime]), e.trigger("freezeTime")
            }
        }
    },
    TileEffects: {
        explosive: {
            duration: 5,
            onMatch: function (e, t) {
                var n = require("app/eventmanager"),
                    r = require("app/gameboard"),
                    i = [];
                for (var s = -1; s < 2; s++) {
                    if (e + s < 0 || e + s >= r.options.rows) continue;
                    for (var o = -1; o < 2; o++) {
                        if (t + o < 0 || t + o >= r.options.columns) continue;
                        i.push({
                            row: e + s,
                            column: t + o,
                            effect: "remove"
                        })
                    }
                }
                return n.trigger("hurtDude", [30]), n.trigger("tileExplode", [{
                    row: e,
                    column: t
                }]), i
            }
        }
    },
    getResourceType: function (e) {
        for (var t in this.ResourceType)
            if (e.length == 1 && e == this.ResourceType[t].char || e == this.ResourceType[t].className) return this.ResourceType[t];
        return null
    },
    getBuildingType: function (e) {
        for (var t in this.BuildingType)
            if (e == this.BuildingType[t].className) return this.BuildingType[t];
        return null
    },
    getEffectType: function (e) {
        return this.TileEffects[e]
    }
}), define("app/entity/tile", ["app/entity/entity", "app/gamecontent"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {
            type: t.ResourceType.Grain,
            row: null,
            column: null
        }, e)
    };
    return n.prototype = new e({
        className: "tile",
        speed: 2
    }), n.constructor = n, n.prototype.el = function () {
        if (this._el == null) {
            var t = require("app/graphics/graphics"),
                n = this._el = e.prototype.el.call(this).addClass(this.options.type.className).append(t.make("litBorder daySide")).append(t.make("litBorder nightSide"));
            n.data("tile", this)
        }
        return this._el
    }, n.prototype.isAdjacent = function (e) {
        return Math.abs(this.options.row - e.options.row) + Math.abs(this.options.column - e.options.column) == 1
    }, n.prototype.repurpose = function (e) {
        return this.options.type = e.type, this.options.row = e.row, this.options.column = e.column, this.el().attr("class", this.options.className + " " + this.options.type.className), this
    }, n
});
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (e) {
        var t = "",
            n, r, i, s, o, u, a, f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) n = e.charCodeAt(f++), r = e.charCodeAt(f++), i = e.charCodeAt(f++), s = n >> 2, o = (n & 3) << 4 | r >> 4, u = (r & 15) << 2 | i >> 6, a = i & 63, isNaN(r) ? u = a = 64 : isNaN(i) && (a = 64), t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
        return t
    },
    decode: function (e) {
        var t = "",
            n, r, i, s, o, u, a, f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) s = this._keyStr.indexOf(e.charAt(f++)), o = this._keyStr.indexOf(e.charAt(f++)), u = this._keyStr.indexOf(e.charAt(f++)), a = this._keyStr.indexOf(e.charAt(f++)), n = s << 2 | o >> 4, r = (o & 15) << 4 | u >> 2, i = (u & 3) << 6 | a, t += String.fromCharCode(n), u != 64 && (t += String.fromCharCode(r)), a != 64 && (t += String.fromCharCode(i));
        return t = Base64._utf8_decode(t), t
    },
    _utf8_encode: function (e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            r < 128 ? t += String.fromCharCode(r) : r > 127 && r < 2048 ? (t += String.fromCharCode(r >> 6 | 192), t += String.fromCharCode(r & 63 | 128)) : (t += String.fromCharCode(r >> 12 | 224), t += String.fromCharCode(r >> 6 & 63 | 128), t += String.fromCharCode(r & 63 | 128))
        }
        return t
    },
    _utf8_decode: function (e) {
        var t = "",
            n = 0,
            r = c1 = c2 = 0;
        while (n < e.length) r = e.charCodeAt(n), r < 128 ? (t += String.fromCharCode(r), n++) : r > 191 && r < 224 ? (c2 = e.charCodeAt(n + 1), t += String.fromCharCode((r & 31) << 6 | c2 & 63), n += 2) : (c2 = e.charCodeAt(n + 1), c3 = e.charCodeAt(n + 2), t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63), n += 3);
        return t
    }
};
define("base64", function (e) {
    return function () {
        var t, n;
        return t || e.Base64
    }
}(this)), define("app/entity/worldentity", ["app/entity/entity", "app/eventmanager"], function (e, t) {
    var n = {
            idle: 0,
            right: 1,
            left: 2,
            attackLeft: 3,
            attackRight: 4
        },
        r = function (e) {
            this.options = $.extend({}, this.options, {}, e), this.hp(this.getMaxHealth()), this.gone = !1
        };
    return r.prototype = new e, r.constructor = r, r.prototype.hp = function (e) {
        return e != null && (this._hp = e, t.trigger("healthChanged", [this])), this._hp
    }, r.prototype.getAnimation = function (e) {
        return n[e]
    }, r.prototype.move = function (e, t) {
        this.tempAnimation = null;
        if (this.p() < e) this.animation(this.getAnimation("right")), this.lastDir = "right";
        else {
            if (!(this.p() > e)) {
                t != null && t(this);
                return
            }
            this.animation(this.getAnimation("left")), this.lastDir = "left"
        }
        var n = this,
            r = require("app/graphics/graphics");
        r.animateMove(this, e, function () {
            n.makeIdle(), t != null && t(n)
        })
    }, r.prototype.moveTo = function (e, t) {
        var n = require("app/graphics/graphics");
        this.tempAnimation = null;
        var r = e.p();
        r < 30 && (r = 30), r > n.worldWidth() - 30 && (r = n.worldWidth() - 30);
        if (this.p() < r) this.animation(this.getAnimation("right")), this.lastDir = "right";
        else {
            if (!(this.p() > r)) {
                t != null && t(this);
                return
            }
            this.animation(this.getAnimation("left")), this.lastDir = "left"
        }
        var i = this,
            s = e;
        n.animateMove(this, r, function () {
            i.makeIdle(), t != null && t(i)
        }, function () {
            return i.p() > 10 && i.p() < n.worldWidth() - 10 && i.attackRange(s)
        })
    }, r.prototype.think = function () {
        return !1
    }, r.prototype.makeIdle = function () {
        this.animation(n.idle)
    }, r.prototype.isIdle = function () {
        return this.action == null
    }, r.prototype.attackRange = function (e) {
        return Math.abs(this.p() - e.p()) <= this.getHitboxWidth() / 2 + e.getHitboxWidth() / 2
    }, r.prototype.distanceFrom = function (e) {
        return Math.abs(this.p() - e.p()) < (this.getHitboxWidth() + e.getHitboxWidth()) / 2 ? 0 : Math.abs(Math.abs(this.p() - e.p()) - this.getHitboxWidth() / 2 - e.getHitboxWidth() / 2)
    }, r.prototype.getMaxHealth = function () {
        return 0
    }, r.prototype.getDamage = function () {
        return 0
    }, r.prototype.takeDamage = function (e) {
        this.isAlive() && (this.hp(this.hp() - e), this.hp() <= 0 && this.die())
    }, r.prototype.die = function () {
        this.action != null && this.action.terminateAction(this), this.action = require("app/action/actionfactory").getAction("Die"), this.action.doAction(this)
    }, r.prototype.isAlive = function () {
        return this.hp() > 0
    }, r.prototype.getHitboxWidth = function () {
        return this.width()
    }, r.prototype.hasSword = function () {
        return !1
    }, r
}), define("app/entity/block", ["app/entity/worldentity", "app/gamecontent"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {
            type: t.ResourceType.Grain
        }, e), this._quantity = 0
    };
    return n.prototype = new e({
        className: "block"
    }), n.constructor = n, n.makeBlock = function (e) {
        var t = new n(e.options);
        return t._quantity = e._quantity, t
    }, n.prototype.el = function () {
        var t = require("app/graphics/graphics");
        return this._el == null && (this._el = e.prototype.el.call(this).addClass(this.options.type.className).append(t.make())), this._el
    }, n.prototype.max = 30, n.prototype.spaceLeft = function () {
        return this.max - this._quantity
    }, n.prototype.quantity = function (e) {
        if (e != null) {
            var t = require("app/graphics/graphics");
            this._quantity = e > this.max ? this.max : e, t.updateBlock(this)
        }
        return this._quantity
    }, n
}), define("app/entity/building", ["app/entity/worldentity", "app/entity/block", "app/gamecontent"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {
            type: n.BuildingType.Shack,
            animationFrames: 1
        }, e), this.options.type.animationFrames != null && (this.options.animationFrames = this.options.type.animationFrames), this.requiredResources = {};
        for (var t in this.options.type.cost) this.requiredResources[t] = this.options.type.cost[t];
        this.options.type.defaultAnimation != null && (this.animationRow = this.options.type.defaultAnimation), this.options.spriteName = this.options.type.spriteName, this.built = !1, this.p(this.options.type.position)
    };
    return r.prototype = new e({
        className: "building"
    }), r.constructor = r, r.makeBuilding = function (e) {
        e.options.type = n.getBuildingType(e.options.type.className);
        var t = new r(e.options);
        return t.requiredResources = e.requiredResources, t.built = e.built, t.obsolete = e.obsolete, t
    }, r.prototype.el = function () {
        if (this._el == null) {
            var t = require("app/graphics/graphics");
            this._el = e.prototype.el.call(this).addClass(this.options.type.className);
            if (!this.built) {
                var n = t.make("resourceBars", "ul");
                n.data("building", this);
                var r = 0;
                for (var i in this.options.type.cost) r++, n.append(t.createResourceBar(i, this.options.type.cost[i]));
                n.addClass("bars-" + r), this._el.append(n)
            }
        }
        return this._el
    }, r.prototype.readyToBuild = function () {
        if (this.built) return !1;
        for (var e in this.requiredResources)
            if (this.requiredResources[e] > 0) return !1;
        return !0
    }, r.prototype.dudeSpot = function () {
        return this.p() + this.el().width() / 2
    }, r.prototype.getReplaces = function (e) {
        return this.options.type.replaces ? e.getBuilding(n.getBuildingType(this.options.type.replaces)) : null
    }, r
}), define("app/gamestate", ["base64", "app/entity/building", "app/entity/block", "app/eventmanager", "app/gamecontent"], function (e, t, n, r, i) {
    var o = 0,
        u = {
            create: function () {
                this.buildings = [], this.stores = [], this.level = 1, this.xp = 0, this.dayNumber = 1, this.items = {}, this.gem = 0, this.mana = 0, this.counts = {}, this.prestige = 0, this.prioritizedBuilding = null, this.health = this.maxHealth(), r.trigger("newGame")
            },
            getExportCode: function (t) {
                try {
                    var n = localStorage["slot" + t];
                    return n ? e.encode(n) : null
                } catch (r) {
                    return null
                }
            },
            getSlotInfo: function (e) {
                try {
                    var t = JSON.parse(localStorage["slot" + e]);
                    if (t) return {
                        maxHealth: u.maxHealth(t.level),
                        day: t.dayNumber,
                        prestiged: t.prestige > 0
                    }
                } catch (n) {
                    return "empty"
                }
            },
            load: function (e) {
                e = e || o;
                try {
                    var r = JSON.parse(localStorage["slot" + e]);
                    if (r) {
                        this.buildings = [];
                        for (var i in r.buildings) this.buildings.push(t.makeBuilding(r.buildings[i]));
                        this.stores = [];
                        for (var i in r.stores) this.stores.push(n.makeBlock(r.stores[i]));
                        this.items = r.items || {}, this.level = r.level, this.xp = r.xp, this.dayNumber = r.dayNumber || 1, this.gem = r.gem || 0, this.mana = r.mana || 0, this.counts = r.counts || {}, this.prestige = r.prestige || 0, this.health = r.health || this.maxHealth(), this.prioritizedBuilding = r.prioritizedBuilding
                    } else this.create(e)
                } catch (s) {
                    this.create(e)
                }
                return o = e, this
            },
            save: function () {
                if (typeof Storage != "undefined" && localStorage) {
                    var e = {
                        buildings: [],
                        stores: [],
                        level: this.level,
                        xp: this.xp,
                        dayNumber: this.dayNumber,
                        items: this.items,
                        gem: this.gem,
                        mana: this.mana,
                        counts: this.counts,
                        prestige: this.prestige,
                        health: this.health,
                        prioritizedBuilding: this.prioritizedBuilding
                    };
                    for (b in this.buildings) {
                        var r = this.buildings[b];
                        e.buildings.push(t.makeBuilding(r))
                    }
                    for (s in this.stores) {
                        var i = this.stores[s];
                        e.stores.push(n.makeBlock(i))
                    }
                    localStorage["slot" + o] = JSON.stringify(e)
                }
                return this
            },
            "import": function (t, n) {
                try {
                    localStorage["slot" + t] = e.decode(n)
                } catch (r) {
                    return null
                }
            },
            deleteSlot: function (e) {
                typeof Storage != "undefined" && localStorage && localStorage.removeItem("slot" + e)
            },
            doPrestige: function () {
                this.buildings.length = 0, this.stores.length = 0, this.prestige = this.prestige ? this.prestige + 1 : 1, this.save()
            },
            savePersistents: function () {
                if (typeof Storage != "undefined" && localStorage && localStorage["slot" + o]) {
                    var e = JSON.parse(localStorage["slot" + o]);
                    e.counts = this.counts, e.health = this.health, localStorage["slot" + o] = JSON.stringify(e)
                }
            },
            removeBlock: function (e) {
                this.stores.splice(this.stores.indexOf(e), 1)
            },
            hasBase: function () {
                var e = !1;
                return function () {
                    return e || function () {
                        for (var t in u.buildings) {
                            var n = u.buildings[t];
                            if (n.options.type.isBase && n.built) return e = !0
                        }
                        return !1
                    }()
                }
            }(),
            hasBuilding: function (e, t) {
                for (var n in this.buildings) {
                    var r = this.buildings[n];
                    if (r.options.type.className == e.className && r.built && (!t || !r.obsolete)) return !0
                }
                return !1
            },
            getBuilding: function (e) {
                for (var t in this.buildings) {
                    var n = this.buildings[t];
                    if (n.options.type.className == e.className) return n
                }
                return null
            },
            maxHealth: function (e) {
                return e = e || this.level, 20 + 10 * e
            },
            maxShield: function () {
                var e = 1;
                for (var t in this.buildings) {
                    var n = this.buildings[t];
                    n.options.type.tileMod == "wood" && n.options.type.tileLevel > e && n.built && (e = n.options.type.tileLevel)
                }
                return 3 * e
            },
            maxSword: function () {
                var e = 1;
                for (var t in this.buildings) {
                    var n = this.buildings[t];
                    n.options.type.tileMod == "stone" && n.options.type.tileLevel > e && n.built && (e = n.options.type.tileLevel)
                }
                return 3 + Math.floor((e - 1) / 3) * 2
            },
            swordDamage: function () {
                var e = 1;
                for (var t in this.buildings) {
                    var n = this.buildings[t];
                    n.options.type.tileMod == "stone" && n.options.type.tileLevel > e && n.built && (e = n.options.type.tileLevel)
                }
                return 1 + (e - 1) - Math.floor((e - 1) / 3)
            },
            maxMana: function () {
                return 3
            },
            magicEnabled: function () {
                return this.gem >= 4
            },
            count: function (e, t) {
                var n = this.counts[e] || 0;
                n += t, this.counts[e] = n
            },
            setIfHigher: function (e, t) {
                if (typeof this.counts == "undefined") return;
                var n = this.counts[e] || 0;
                n = t > n ? t : n, this.counts[e] = n
            }
        };
    return u
}), define("app/resources", ["jquery", "app/eventmanager", "app/gamecontent", "app/gamestate"], function (e, t, n, r) {
    var i = {
        options: {
            rows: 3,
            cols: 3
        },
        init: function (n) {
            e.extend(this.options, n), this.loaded = !0, t.trigger("resourceInit")
        },
        returnBlock: function (e) {
            r.stores.push(e), t.trigger("addResource", [e]), this.checkMaximum()
        },
        collectResource: function (e, n) {
            this.loaded && require(["app/entity/block"], function (s) {
                var o = null;
                for (var u = 0, a = r.stores.length; u < a; u++) {
                    var f = r.stores[u];
                    if (f.options.type.className == e.className && f.spaceLeft() > 0) {
                        o = f;
                        break
                    }
                }
                o == null && (o = new s({
                    type: e
                }), r.stores.push(o), i.checkMaximum(), t.trigger("addResource", [o]));
                var l = n - o.spaceLeft();
                r.count("GATHERED", n > o.spaceLeft() ? o.spaceLeft() : n), o.quantity(o.quantity() + n), l > 0 && i.collectResource(e, l)
            })
        },
        checkMaximum: function () {
            if (r.stores.length > this.max()) {
                var e = r.stores.splice(0, r.stores.length - this.max());
                for (var t in e) e[t].gone = !0, e[t].el().remove()
            }
        },
        setSize: function (e, t) {
            this.options.rows = e, this.options.cols = t
        },
        max: function () {
            return this.options.cols * this.options.rows
        }
    };
    return i
}), define("app/gameboard", ["jquery", "app/eventmanager", "app/entity/tile", "app/resources", "app/gamecontent", "app/gamestate"], function (e, t, n, r, i, s) {
    function T() {
        var e = {
            g: 2,
            w: 2,
            s: 2
        };
        return s.hasBuilding(i.BuildingType.BrickLayer) && (e.c = 2), s.hasBuilding(i.BuildingType.Weaver) && (e.l = 2), e
    }

    function N() {
        for (var e = 0, n = x.options.columns; e < n; e++) {
            for (var r = 0, i = x.options.rows; r < i; r++) {
                var s = T();
                if (e > 0) {
                    var o = B(r, e - 1);
                    s[o]--, e > 1 && B(r, e - 2) == o && s[o]--
                }
                if (r > 0) {
                    var o = B(r - 1, e);
                    s[o]--, r > 1 && B(r - 2, e) == o && s[o]--
                }
                a += W(s)
            }
            a += x.SEP
        }
        require("app/engine").setGraphicsCallback(function () {}), t.trigger("draw", ["board.fill", a])
    }

    function C() {
        k(), t.trigger("noMoreMoves")
    }

    function k() {
        a = "", require("app/engine").setGraphicsCallback(N), t.trigger("draw", ["board.clear", {}])
    }

    function L() {
        if (require("app/engine").paused) {
            S = !0;
            return
        }
        S = !1, R();
        var e = q(a),
            n = q(a),
            r = !1,
            o = {};
        a.replace(c, function (t, n, i, s) {
            r = !0;
            if (t.length > 3) {
                var u = O(i);
                o[u] = o[u] ? o[u] + 1 : 1
            }
            for (var a = 0, f = t.length; a < f; a++) e[i + a] = 1
        }), f.replace(c, function (e, t, i, s) {
            r = !0;
            if (e.length > 3) {
                var u = O(i + Math.floor(Math.random() * e.length), !0);
                o[u] = o[u] ? o[u] + 1 : 1
            }
            for (var a = 0, f = e.length; a < f; a++) n[U(i + a)] = 1
        });
        var u = [],
            h = [],
            w = {};
        if (r) {
            E++, d && s.count("SWAPPED", 1);
            var N = {};
            for (var k = 0, P = e.length; k < P; k++)
                if ((e[k] == 1 || n[k] == 1) && B(k) != g) {
                    var H = i.getResourceType(B(k)),
                        j = H.className;
                    w[j] = w[j] ? w[j] + 1 : 1, N[k] = j, F(k, g), u.push({
                        position: _(k),
                        type: H
                    });
                    if (v) {
                        var X = v.charAt(k);
                        I(k, g);
                        if (X != y) {
                            var V = m[X];
                            m[X] = null, i.getEffectType(V.type).onMatch(M(k), O(k)).forEach(function (e) {
                                var t = A(e.row, e.column);
                                switch (e.effect) {
                                    case "remove":
                                        F(t, g), I(t, g);
                                        var n = N[t];
                                        n && n != "-" ? (N[t] = "-", w[n]--) : n || (N[t] = "-", u.push({
                                            position: {
                                                row: e.row,
                                                col: e.column
                                            },
                                            type: null
                                        }))
                                }
                            })
                        }
                    }
                }
            var $ = T(),
                J = z($);
            a = a.replace(p, "");
            var Q = a.split(x.SEP),
                G = null;
            v && (v = v.replace(p, ""), G = v.split(x.SEP));
            for (var Y = 0, P = Q.length - 1; Y < P; Y++) {
                var Z = Q[Y],
                    et = x.options.rows - Z.length;
                if (et > 0) {
                    var tt = !require("app/engine").isNight() && o[Y] && s.magicEnabled() ? o[Y] : 0,
                        nt = {};
                    if (tt > 0) {
                        var rt = [];
                        for (var it = 0; it < tt; it++) rt.push(it);
                        while (tt > 0 && rt.length > 0) {
                            var st = Math.random() * rt.length;
                            st |= st, nt[rt[st]] = !0, rt.splice(st, 1), tt--
                        }
                    }
                    for (var ot = et - 1; ot >= 0; ot--) {
                        var ut;
                        nt[ot] ? ut = "m" : ut = W($, J), Z = ut + Z, h.push({
                            row: ot,
                            col: Y,
                            "char": ut
                        }), v && (G[Y] = y + G[Y])
                    }
                    Q[Y] = Z
                }
            }
            a = Q.join(x.SEP), v && (v = G.join(x.SEP), K()), d = null, require("app/engine").setGraphicsCallback(L), t.trigger("draw", ["board.match", {
                removed: u,
                added: h,
                isNight: require("app/engine").isNight(),
                side: l
            }]), t.trigger("tilesCleared", [w, l, b])
        } else t.trigger("tilesSwapped", [d == null]), s.setIfHigher("CHAIN", E), E = 0, d ? x.switchTiles() : D() || C();
        b = !1
    }

    function A(e, t) {
        return t * (x.options.rows + 1) + e
    }

    function O(e, t) {
        if (t) return e % (x.options.columns + 1);
        var n = e / (x.options.rows + 1);
        return n | n
    }

    function M(e, t) {
        if (t) {
            var n = e / (x.options.columns + 1);
            return n | n
        }
        return e % (x.options.rows + 1)
    }

    function _(e) {
        return {
            row: M(e),
            col: O(e)
        }
    }

    function D() {
        R();
        var e, t = /(.?)([^X])\2(.)/g;
        while (e = t.exec(a)) {
            if (e[1] && e[1] != x.SEP && H(e.index, e[2]) > 1) return !0;
            if (e[3] != x.SEP && H(e.index + e[0].length - 1, e[2]) > 1) return !0
        }
        while (e = t.exec(f)) {
            if (e[1] && e[1] != x.SEP && H(U(e.index), e[2]) > 1) return !0;
            if (e[3] != x.SEP && H(U(e.index + e[0].length - 1), e[2]) > 1) return !0
        }
        t = /([^X])[^X]\1/g;
        while (e = t.exec(a))
            if (H(e.index + 1, e[1]) > 2) return !0;
        while (e = t.exec(f))
            if (H(U(e.index + 1), e[1]) > 2) return !0;
        return !1
    }

    function P(e) {
        return [e > 0 ? B(e - 1) : null, e < a.length - 1 ? B(e + 1) : null, e > x.options.rows ? B(e - x.options.rows - 1) : null, e < a.length - x.options.rows - 2 ? B(e + x.options.rows + 1) : null]
    }

    function H(e, t) {
        var n = 0;
        return P(e).forEach(function (e) {
            e === t && n++
        }), n
    }

    function B(e, t) {
        return t == null ? a.charAt(e) : a.charAt(A(e, t))
    }

    function j(e, t) {
        return v ? t == null ? v.charAt(e) : v.charAt(A(e, t)) : null
    }

    function F(e, t, n) {
        var r = n ? A(e, t) : e,
            i = n ? n : t;
        a = a.substring(0, r) + i + a.substring(r + 1)
    }

    function I(e, t, n) {
        if (v == null) {
            v = "";
            for (var r = 0, i = x.options.columns; r < i; r++) {
                for (var s = 0, o = x.options.rows; s < o; s++) v += y;
                v += x.SEP
            }
        }
        var u = n ? A(e, t) : e,
            a = n ? n : t;
        v = v.substring(0, u) + a + v.substring(u + 1)
    }

    function q(e) {
        var t = [];
        for (var n = 0, r = e.length; n < r; n++) t.push(0);
        return t
    }

    function R() {
        f = "";
        for (var e = 0; e < x.options.rows; e++) {
            for (var t = 0; t < x.options.columns; t++) f += B(e, t);
            f += x.SEP
        }
    }

    function U(e) {
        return A(M(e, !0), O(e, !0))
    }

    function z(e) {
        total = 0;
        for (tileChar in e) e[tileChar] = e[tileChar] < 0 ? 0 : e[tileChar], total += e[tileChar];
        return total
    }

    function W(e, t) {
        t == null && (t = z(e));
        var n = 0,
            r = Math.random(),
            i = "";
        for (tileChar in e) {
            i = tileChar;
            var s = e[tileChar] / t;
            if (r < n + s) break;
            n += s
        }
        return i
    }

    function X() {
        for (var e = 34; e < 255; e++) {
            var t = String.fromCharCode(e);
            if (t == x.SEP) continue;
            if (m[t] == null) return t
        }
        throw "No effect characters available. Something's wrong!"
    }

    function V(e, n, r) {
        var s = A(e, n);
        if (v && v.charAt(s) != y) return;
        var o = X();
        m[o] = {
            type: r,
            duration: i.getEffectType(r).duration
        }, I(e, n, o), t.trigger("drawEffect", [{
            row: e,
            column: n,
            effectType: r
        }])
    }

    function $(e) {
        if (e && v)
            for (var t in m) {
                var n = m[t];
                n != null && (n.duration--, n.duration <= 0 && J(t))
            }
    }

    function J(e) {
        var n = v.indexOf(e);
        n >= 0 && (t.trigger("drawRemoveEffect", [{
            row: M(n),
            column: O(n),
            effectType: m[e].type
        }]), I(n, y), m[e] = null, K())
    }

    function K() {
        h.test(v) || (v = null)
    }
    var o = 0,
        u = 0,
        a = "",
        f = "",
        l = null,
        c = null,
        h = null,
        p = null,
        d = null,
        v = null,
        m = {},
        g = "O",
        y = "!",
        b = !1,
        w = !1,
        E = 0,
        S = !1,
        x = {
            SEP: "X",
            options: {
                rows: 8,
                columns: 8
            },
            init: function (n) {
                e.extend(this.options, n), _el = null, r.loaded = !1, a = "", v = null, E = 0, c = new RegExp("([^" + x.SEP + "])\\1{2,}", "g"), p = new RegExp(g, "g"), h = new RegExp("[^" + y + x.SEP + "]"), t.bind("refreshBoard", k), t.bind("createTileEffect", V), t.bind("tilesSwapped", $), t.bind("afterUnpaused", function () {
                    S && L()
                }), window.tiles = function () {
                    console.log(a), console.log(f)
                }
            },
            switchTiles: function (e, n) {
                var r = L;
                !e && !n && d && (e = d.pos2, n = d.pos1, r = function () {}), l = e.col < x.options.columns / 2 ? "left" : "right", d = {
                    pos1: e,
                    pos2: n
                };
                var i = B(e.row, e.col),
                    s = B(n.row, n.col);
                F(e.row, e.col, s), F(n.row, n.col, i);
                if (v) {
                    var o = j(e.row, e.col),
                        u = j(n.row, n.col);
                    I(e.row, e.col, u), I(n.row, n.col, o)
                }
                b = !0, require("app/engine").setGraphicsCallback(r), t.trigger("draw", ["board.swap", {
                    pos1: e,
                    pos2: n
                }])
            },
            addEffectRandomly: function (e) {
                var t = Math.random() * x.options.rows,
                    n = Math.random() * x.options.rows;
                V(t | t, n | n, e)
            },
            canMove: function () {
                return o == 0 && u == 0 && !w
            },
            shouldDrawResourceEffect: function (e) {
                return e == i.ResourceType.Grain || s.hasBase()
            }
        };
    return x
}), define("app/graphics/gameboard", ["app/eventmanager", "app/gameboard", "app/entity/tile", "app/gamecontent", "app/gameoptions"], function (e, t, n, r, i) {
    function p() {
        return o == null && (m(), o = g(t.options.rows, t.options.columns), o.addClass("hidden"), s.addToGame(o)), o
    }

    function d(e, t, n) {
        a[e] = a[e] || [], a[e][t] = n
    }

    function v(e, t) {
        return a[e][t]
    }

    function m() {
        $(".gameBoard").remove()
    }

    function g(e, n) {
        var r = s.make("gameBoard litBorder");
        t.options.mobile && $("body").addClass("portrait"), u = s.make("tileContainer").attr("id", "tileContainer").appendTo(r);
        var i = s.make("tile").hide().appendTo("body");
        return f = i.width(), l = i.height(), r.width(f * n), r.height(l * e), i.remove(), r
    }

    function y(e) {
        var t = a[e.pos1.row][e.pos1.col],
            n = a[e.pos2.row][e.pos2.col];
        return a[e.pos1.row][e.pos1.col] = n, a[e.pos2.row][e.pos2.col] = t, t.options.row = e.pos2.row, t.options.column = e.pos2.col, n.options.row = e.pos1.row, n.options.column = e.pos1.col, C(t), C(n), 200
    }

    function b() {
        for (var e in a)
            for (var t in a[e]) M(e, t);
        return 300
    }

    function w(n) {
        var r = n.split(""),
            i = 0,
            s = 0,
            o = (t.options.rows + t.options.columns) * h;
        return function u() {
            var n = r.shift();
            if (n == t.SEP) i++, s = 0;
            else {
                var a = O(s, i, n);
                setTimeout(function () {
                    C(a), setTimeout(function () {
                        e.trigger("tileDrop")
                    }, 100)
                }, 200 + o - (s + (t.options.columns - i)) * h), s++
            }
            r.length > 0 && setTimeout(u, 0)
        }(), o + 200
    }

    function S(e, t) {
        var n;
        E.length == 0 ? n = s.make("resourceEffect").appendTo(p()) : n = E.pop();
        var r = e.col * f + f / 2,
            i = e.row * l + l / 2;
        return n.addClass(t.className).css({
            transform: "translate3d(" + r + "px, " + i + "px, 0px) scale(1)",
            "-webkit-transform": "translate3d(" + r + "px, " + i + "px, 0px) scale(1)",
            "-moz-transform": "translate3d(" + r + "px, " + i + "px, 0px) scale(1)",
            "-ms-transform": "translate3d(" + r + "px, " + i + "px, 0px) scale(1)",
            "-o-transform": "translate3d(" + r + "px, " + i + "px, 0px) scale(1)"
        }).removeClass("pooled"), n
    }

    function x(e) {
        e.attr("class", "resourceEffect pooled"), E.push(e)
    }

    function T(e, n, r, i) {
        if (n != null && t.shouldDrawResourceEffect(n)) {
            var o = S(e, n);
            o.css("left");
            var u = n.effectDest[r ? "night" : "day"];
            u == "side" ? u = [i == "left" ? 0 : s.worldWidth(), -20] : u == "sword" && (u = [-20, 28 * s.numHearts() + 14]), o.css({
                transform: "translate3d(" + u[0] + "px, " + u[1] + "px, 0px) scale(0.2)",
                "-webkit-transform": "translate3d(" + u[0] + "px, " + u[1] + "px, 0px) scale(0.2)",
                "-moz-transform": "translate3d(" + u[0] + "px, " + u[1] + "px, 0px) scale(0.2)",
                "-ms-transform": "translate3d(" + u[0] + "px, " + u[1] + "px, 0px) scale(0.2)",
                "-o-transform": "translate3d(" + u[0] + "px, " + u[1] + "px, 0px) scale(0.2)"
            }), setTimeout(function () {
                x(o)
            }, 700)
        }
    }

    function N(t) {
        var n = [];
        if (t.removed)
            for (var r in t.removed) {
                var i = t.removed[r].position;
                M(i.row, i.col), T(i, t.removed[r].type, t.isNight, t.side);
                for (var s = i.row - 1; s >= 0; s--) {
                    var o = v(s, i.col);
                    o && (o.options.row++, n.push(o))
                }
            }
        if (t.added)
            for (var r in t.added) {
                var u = t.added[r],
                    a = O(u.row, u.col, u.char);
                n.push(a)
            }
        return setTimeout(function () {
            for (var e in n) {
                var t = n[e];
                d(t.options.row, t.options.column, t), C(t)
            }
        }, 200), setTimeout(function () {
            e.trigger("tileDrop")
        }, 300), 400
    }

    function C(e, t, n) {
        t = t || e.options.row, n = n || e.options.column;
        var r = e.el(),
            i = k(t, n);
        r.css({
            transform: "translate3d(" + i.left + "px, " + i.top + "px, 0)"
        })
    }

    function k(e, t) {
        return {
            top: e * l + c,
            left: t * f + c
        }
    }

    function A() {
        for (var e = 0; e < t.options.rows * t.options.columns * 2; e++) {
            var i = new n({
                row: -1,
                column: 0,
                type: r.ResourceType.Grain
            });
            i.el().addClass("hidden pooled"), C(i, i.options.row, i.options.column), u.append(i.el()), L.push(i)
        }
    }

    function O(e, i, s) {
        var o, a = {
            type: r.getResourceType(s),
            row: e,
            column: i
        };
        if (L.length == 0) {
            var o = new n(a);
            u.append(o.el())
        } else o = L.pop().repurpose(a);
        return d(e, i, o), C(o, o.options.row - t.options.rows, o.options.column), o
    }

    function M(e, t) {
        var n = v(e, t);
        d(e, t, null), n.el().addClass("hidden"), setTimeout(function () {
            n.el().addClass("pooled"), C(n, -1), L.push(n)
        }, 200)
    }

    function _(e) {
        var t = v(e.row, e.column);
        t && t.el().addClass("effect_" + e.effectType)
    }

    function D(e) {
        var t = v(e.row, e.column);
        t && t.el().removeClass("effect_" + e.effectType)
    }

    function P(e) {
        var t = s.make("explosion"),
            n = k(e.row, e.column);
        t.css({
            transform: "translate3d(" + n.left + "px, " + n.top + "px, 0)"
        }), u.append(t), setTimeout(function () {
            t.remove()
        }, 400), t.show(function () {
            t.addClass("exploded")
        })
    }
    var s = null,
        o = null,
        u = null,
        a = [],
        f = 0,
        l = 0,
        c = 2,
        h = 100,
        E = [],
        L = [];
    return {
        init: function () {
            s = require("app/graphics/graphics"), a.length = 0, o = null, p(), A(), E.length = 0, e.bind("drawEffect", _), e.bind("drawRemoveEffect", D), e.bind("tileExplode", P), e.bind("gameLoaded", function () {
                p().removeClass("hidden")
            })
        },
        el: p,
        attachHandler: function (e, t, n) {
            t ? p().on(e, t, n) : p().on(e, n)
        },
        handleDrawRequest: function (e, t) {
            switch (e.toLowerCase()) {
                case "clear":
                    return b(t);
                case "fill":
                    return w(t);
                case "swap":
                    return y(t);
                case "match":
                    return N(t)
            }
        },
        checkTilePool: function () {
            return L.length
        }
    }
}), define("app/graphics/world", ["app/eventmanager"], function (e) {
    function n() {
        var e = require("app/graphics/graphics");
        return t == null && (t = e.make("world"), e.addToBoard(t)), t
    }
    var t = null;
    return {
        init: function () {
            t = null, n()
        },
        attachHandler: function (e, t, r) {
            t ? n().on(e, t, r) : n().on(e, r)
        },
        add: function (e) {
            n().append(e)
        },
        remove: function (e) {
            e.remove()
        }
    }
}), define("app/graphics/resources", ["app/eventmanager", "app/gamestate"], function (e, t) {
    function r() {
        var e = require("app/graphics/graphics");
        if (n == null) {
            n = e.make("resources"), e.hide(n), e.addToWorld(n);
            for (var r in t.stores) {
                var s = t.stores[r];
                i(s), e.updateBlock(s)
            }
            setTimeout(function () {
                e.show(n)
            }, 10)
        }
        return n
    }

    function i(e) {
        n.append(e.el())
    }

    function s() {
        r()
    }
    var n = null;
    return {
        init: function () {
            n = null, e.bind("addResource", i), e.bind("resourceInit", s)
        }
    }
}), define("app/graphics/loot", ["app/eventmanager", "app/gamestate"], function (e, t) {
    function r(e) {
        e.animation(1)
    }

    function i(e, t) {
        var r = n.make("loot " + e);
        n.addToWorld(r), n.setPosition(r, t.p()), setTimeout(function () {
            n.remove(r)
        }, 1500)
    }

    function s() {
        for (var e in t.items) o(e, t.items[e])
    }

    function o(e, t) {
        var r = n.get("." + e, f());
        r == null && (r = n.make("hidden button litBorder " + e).append(n.make()).data("lootName", e).appendTo(f()).append(n.make()), require("app/gamecontent").LootType[e].large ? r.addClass("large") : r.append(n.make()).append(n.make())), r.removeClass("charge_0 charge_1 charge_2 charge_3").addClass("charge_" + t), r.removeClass("hidden")
    }

    function u(e) {
        if (e == "bomb") {
            var t = n.make("bombsplosion").css("left", require("app/world").getDude().p());
            n.addToWorld(t), setTimeout(function () {
                t.remove()
            }, 790)
        }
    }

    function f() {
        return a == null && (a = n.make("hidden inventory litBorder"), n.addToBoard(a), setTimeout(function () {
            a.removeClass("hidden")
        }, 100)), a
    }
    var n = null,
        a = null;
    return {
        init: function () {
            a = null, n = require("app/graphics/graphics"), e.bind("pickupLoot", r), e.bind("lootGained", i), e.bind("lootFound", o), e.bind("lootUsed", o), e.bind("lootUsed", u), e.bind("gameLoaded", s), s()
        }
    }
}), define("app/graphics/magic", ["app/eventmanager", "app/gamestate"], function (e, t) {
    function u() {
        if (r == null) {
            var e = require("app/graphics/graphics");
            r = e.make("hidden magic").append(e.make("button litBorder").append(e.make("inner").append(e.make()))), l(t.mana, t.maxMana()), e.addToBoard(r), setTimeout(function () {
                r.removeClass("hidden")
            }, 100)
        }
        return r
    }

    function a() {
        if (s == null) {
            var e = require("app/graphics/graphics"),
                t = require("app/gamecontent");
            s = e.make("spells");
            for (var n in t.Spells) s.append(e.make(n + " litBorder spell").data("spellName", n))
        }
        return s
    }

    function f() {
        if (o == null) {
            var e = require("app/graphics/graphics");
            o = e.make("states"), e.addToBoard(o)
        }
        return o
    }

    function l(e, t) {
        var n = Math.ceil(e / t * 100);
        e == t ? u().find(".button").addClass("full") : u().find(".button").removeClass("full"), u().find(".button > .inner > div").css("height", n + "%")
    }

    function c(t) {
        var n = t.closest(".spell");
        if (n.length > 0) {
            if (!i) return !0;
            e.trigger("castSpell", [n.data("spellName")])
        }
        h(t.closest(".button"))
    }

    function h(e) {
        var r = !1;
        if (i) {
            r = e ? e.hasClass("open") : !1;
            var s = require("app/graphics/graphics");
            s.get(".button.open", null, !0).removeClass("open"), setTimeout(a().detach.bind(a()), 200), i = !1
        }
        e && !r && t.mana >= n && (e.append(a()), a().css("left"), e.addClass("open"), i = !0)
    }

    function p() {
        var e = require("app/graphics/graphics");
        e.get(".button.open").removeClass("open")
    }

    function d(e) {
        var t = require("app/graphics/graphics"),
            n = f().find("." + e.className);
        n.remove(), n = t.make(e.className).appendTo(f()), setTimeout(function () {
            n.addClass("expiring")
        }, e.duration - 3e3), setTimeout(function () {
            n.remove()
        }, e.duration)
    }

    function v(e) {
        f().find("." + e.className).remove()
    }
    var n = 3,
        r = null,
        i = !1,
        s = null,
        o = null;
    return {
        init: function () {
            r = null, s = null, o = null, e.bind("updateMana", l), e.bind("magicClick", c), e.bind("toggleMenu", h), e.bind("newStateEffect", d), e.bind("endStateEffect", v), e.bind("enableMagic", function () {
                u()
            })
        }
    }
}), define("app/graphics/audio", ["app/eventmanager", "app/gamestate"], function (e, t) {
    function a() {
        if (s == null) {
            s = i.make("volumeControls");
            var e = f("music"),
                t = f("effects");
            o = e.handle, u = t.handle, s.append(e).append(t), i.addToMenu(s)
        }
        return s
    }

    function f(e) {
        var t = i.make(e + "Volume volumeSlider").append(i.make("nightSprite")).append(i.make("sliderTrack litBorder"));
        return t.handle = i.make("sliderHandle").data("controls", e).appendTo(t), t
    }

    function l(e, t) {
        var n = e.parent().find(".sliderTrack").width();
        e.css("transform", "translate3d(" + t * n + "px, 0px, 0px)"), e.data("volume", t)
    }

    function h(e) {
        e.originalEvent.changedTouches && (e = e.originalEvent.changedTouches[0]), c = $(e.target)
    }

    function p(t) {
        t.originalEvent.changedTouches && (t = t.originalEvent.changedTouches[0]);
        if (c != null) {
            c._cachedOffsetX == null && (c._cachedOffsetX = c.parent().find(".sliderTrack").offset().left, c._cachedOffsetWidth = c.parent().find(".sliderTrack").width());
            var i = n.exec(c.css("transform"));
            i == null && (i = r.exec(c.css("transform")));
            if (i != null) var s = parseFloat(i[1]) / c._cachedOffsetWidth;
            switch (c.data("controls")) {
                case "music":
                    e.trigger("setMusicVolume", [s]);
                    break;
                case "effects":
                    e.trigger("setEffectsVolume", [s])
            }
        }
        c = null
    }

    function d(e) {
        e.originalEvent.changedTouches && (e = e.originalEvent.changedTouches[0]);
        if (c != null) {
            c._cachedOffsetX == null && (c._cachedOffsetX = c.parent().find(".sliderTrack").offset().left, c._cachedOffsetWidth = c.parent().find(".sliderTrack").width());
            var t = e.pageX - c._cachedOffsetX;
            t < 0 ? t = 0 : t > c._cachedOffsetWidth && (t = c._cachedOffsetWidth), c.css("transform", "translate3d(" + t + "px, 0px, 0px)")
        }
    }

    function v() {
        l(o, require("app/gameoptions").get("musicVolume")), l(u, require("app/gameoptions").get("effectsVolume"))
    }
    var n = /matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ([0-9\.]+)/,
        r = /matrix\(1, 0, 0, 1, ([0-9\.]+)/,
        i = null,
        s = null,
        o = null,
        u = null,
        c = null;
    return {
        init: function () {
            i = require("app/graphics/graphics"), s && s.remove(), s = null, a(), v(), o.off().on("mousedown touchstart", h), u.off().on("mousedown touchstart", h), a().off().on("mousemove touchmove", d), i.get(".menuBar").off().on("mouseup touchend", p), window.onresize = v
        }
    }
}), define("app/graphics/sprites", [], function () {
    function r() {
        for (var e in t) {
            var r = t[e][0];
            typeof n[r] == "undefined" && i(r)
        }
    }

    function i(t) {
        n[t] = !1;
        var r = new Image;
        r.onload = function () {
            n[t] = !0
        }, r.src = e + "img/" + t + ".png"
    }

    function s(e) {
        return t[e] || [null, 0]
    }
    var e = "./",
        t = {
            blacksmith: ["buildings", 0],
            bricklayer: ["buildings", 640],
            sawmill: ["buildings", 960],
            shack: ["buildings", 1600],
            tower: ["buildings", 1920],
            weaver: ["buildings", 2320],
            demon: ["monsters", 0],
            dude: ["monsters", 602],
            dudenight: ["monsters", 1018],
            earthelemental: ["monsters", 1434],
            fireelemental: ["monsters", 1952],
            harmour: ["monsters", 2239],
            imp: ["monsters", 2582],
            lich: ["monsters", 3002],
            lizardman: ["monsters", 3542],
            rat: ["monsters", 3787],
            skeleton: ["monsters", 3878],
            spider: ["monsters", 4102],
            warlock: ["monsters", 4368],
            waterelemental: ["monsters", 4627],
            zombie: ["monsters", 4900],
            bucklericon: ["icons", 0],
            buttonicons: ["icons", 60],
            dragoneffects: ["icons", 88],
            fireball: ["icons", 176],
            gem: ["icons", 183],
            heart: ["icons", 279],
            items: ["icons", 335],
            menu: ["icons", 363],
            music: ["icons", 443],
            social: ["icons", 699],
            spells: ["icons", 795],
            star: ["icons", 875],
            sun: ["icons", 891],
            swordicon: ["icons", 951],
            treasurechest: ["icons", 1011],
            tilesday: ["tiles", 0],
            tilesnight: ["tiles", 468],
            dragon: ["dragonsprite", 0],
            dragonhead: ["dragonsprite", 1640],
            dragonneck: ["dragonsprite", 1670]
        },
        n = {};
    return r(), {
        getOffset: function (e) {
            return s(e)[1]
        },
        getFilename: function (e) {
            return s(e)[0]
        },
        isReady: function () {
            for (var e in n)
                if (!n[e]) return !1;
            return !0
        }
    }
}), define("app/graphics/graphics", ["jquery", "app/eventmanager", "app/textStore", "app/gameoptions", "app/graphics/gameboard", "app/graphics/world", "app/graphics/resources", "app/graphics/loot", "app/graphics/magic", "app/graphics/audio", "app/graphics/sprites"], function (e, t, n, r, i, s, o, u, a, f, l) {
    function A(e) {
        C(A), e = e || Date.now();
        if (!k) {
            k = e;
            return
        }
        if (!require("app/engine").paused) {
            var t = e - k;
            for (var n in L) {
                var r = L[n],
                    i = r.entity,
                    s = r.destination - i.p(),
                    o = s / Math.abs(s),
                    u = t / r.speed;
                s * o < u && (u = s * o), i.p(i.p() + u * o), O(i, i.p());
                if (i.p() == r.destination || r.stopShort && r.stopShort()) delete L[i.guid()], r.callback && r.callback()
            }
        }
        k = e
    }

    function O(e, t) {
        var n = e.el ? e.el() : e,
            r = "translateX(" + (t - e.width() / 2) + "px)";
        n.css({
            transform: r,
            "-webkit-transform": r,
            "-moz-transform": r,
            "-ms-transform": r,
            "-o-transform": r
        })
    }

    function M(e, n) {
        var r = e.substring(0, e.indexOf("."));
        e = e.substring(e.indexOf(".") + 1);
        var l = null;
        switch (r.toLowerCase()) {
            case "board":
                l = i;
                break;
            case "world":
                l = s;
                break;
            case "resource":
                l = o;
                break;
            case "loot":
                l = u;
                break;
            case "magic":
                l = a;
                break;
            case "audio":
                l = f
        }
        var c = 0;
        l != null && l.handleDrawRequest && (c = l.handleDrawRequest(e, n)), setTimeout(function () {
            t.trigger("graphicsActionComplete")
        }, c)
    }

    function _(t, n, r) {
        var s = "";
        t.forEach(function (e) {
            s += (s.length > 0 ? ", " : "") + ".tile." + e
        });
        var o = e(s);
        o.addClass("hidden"), setTimeout(function () {
            i.el().removeClass(r).addClass(n), o.removeClass("hidden")
        }, 300)
    }

    function P(e) {
        Z.get("body").addClass("bigExplosion"), setTimeout(function () {
            D(e).addClass("down")
        }, 2e3)
    }

    function H() {
        t.trigger("phaseChange", [!1]), D().removeClass("down"), i.el().removeClass("dragonFight");
        var e = Z.get("body");
        setTimeout(function () {
            e.addClass("fadeOut")
        }, 1400), setTimeout(function () {
            e.removeClass("bigExplosion fadeOut")
        }, 2800)
    }

    function B() {
        D().removeClass("down"), i.el().removeClass("dragonFight");
        var e = Z.get("body");
        e.removeClass("night"), setTimeout(function () {
            e.addClass("fadeOut"), t.trigger("prestige")
        }, 1400), setTimeout(function () {
            e.removeClass("bigExplosion fadeOut")
        }, 2800)
    }

    function j(e, t) {
        e.el().remove(), Z.updateCosts(t)
    }

    function F(e) {
        var t = Math.ceil(e / h),
            n = 0;
        return t > c && (n = t - c, t = c), {
            total: t,
            big: n
        }
    }

    function I(n, r) {
        var i = Z.make("saveSlot").data("slotIndex", r),
            s = [],
            o = Z.make("slotSide").appendTo(i);
        if (n === "empty") i.addClass("empty"), o.text(Z.getText("NEWGAME")), s.push({
            className: "import",
            text: "IMPORT",
            click: R.bind(i, i)
        });
        else {
            var u = F(n.maxHealth);
            for (var a = 0; a < u.total; a++) Z.make("full " + (a < u.big ? "bigheart" : "heart")).append(Z.make("mask")).appendTo(o);
            s = s.concat([{
                className: "export",
                text: "EXPORT",
                click: U.bind(i, i)
            }, {
                className: "delete",
                text: "DELETE",
                click: z.bind(i, i)
            }]);
            var f = Z.make("day").text(Z.getText("DAY") + " " + n.day);
            n.prestiged && f.prepend(Z.make("star")), o.append(f)
        }
        return i.append(Z.make("infoSide").click(function () {
            return !1
        })), q(o, s), i.on("click touchstart", function (n) {
            n.target.tagName != "TEXTAREA" && (require("app/audio/audio").play("Click"), t.trigger("slotChosen", [r]), e("#loadingScreen").addClass("hidden"), setTimeout(function () {
                e("#loadingScreen").remove()
            }, 1e3))
        }), i
    }

    function q(e, t) {
        var n = Z.make("buttons", "ul");
        for (var r in t) {
            var i = t[r];
            n.append(Z.make(i.className, "li").on("click touchstart", i.click).attr("title", Z.getText(i.text)))
        }
        n.appendTo(e)
    }

    function R(e) {
        t.trigger("click", ["import"]), e.addClass("bigView flipped");
        var n = e.find(".infoSide");
        return n.append(Z.make("labelText").text(Z.getText("IMPORT_CODE"))), n.append(Z.make("exportCode", "textarea")), q(n, [{
            className: "confirm",
            text: "CONFIRM",
            click: X.bind(e, e)
        }, {
            className: "cancel",
            text: "CANCEL",
            click: V.bind(e, e)
        }]), !1
    }

    function U(e) {
        t.trigger("click", ["export"]), e.addClass("bigView flipped");
        var n = e.find(".infoSide");
        return n.append(Z.make("labelText").text(Z.getText("EXPORT_CODE"))), n.append(Z.make("exportCode", "textarea").text(require("app/gamestate").getExportCode(e.data("slotIndex"))).attr("readonly", !0)), q(n, [{
            className: "confirm",
            text: "CONFIRM",
            click: V.bind(e, e)
        }]), !1
    }

    function z(e) {
        t.trigger("click", ["delete"]), e.addClass("confirmDelete flipped");
        var n = e.find(".infoSide");
        return n.append(Z.make("confirmText").text(Z.getText("ARE_YOU_SURE"))), q(n, [{
            className: "confirm",
            text: "CONFIRM",
            click: W.bind(e, e)
        }, {
            className: "cancel",
            text: "CANCEL",
            click: V.bind(e, e)
        }]), !1
    }

    function W(e) {
        var n = e.data("slotIndex");
        return t.trigger("deleteSlot", [n]), Z.get(".saveSlot:nth-child(" + (n + 1) + ")").before(I("empty", n)), e.remove(), !1
    }

    function X(e) {
        var n = e.data("slotIndex"),
            r = e.find("textarea").val();
        return t.trigger("importSlot", [n, r]), !1
    }

    function V(e) {
        var t = e.hasClass("empty");
        return e.removeClass("flipped"), setTimeout(function () {
            e.find(".infoSide").empty(), e.attr("class", "saveSlot" + (t ? " empty" : ""))
        }, 500), !1
    }

    function J() {
        var e = document.documentElement.clientWidth / p,
            t = document.documentElement.clientHeight / (require("app/gameboard").options.mobile ? v : d);
        $ || ($ = Q());
        var n = e < t ? e : t;
        n != E && n < 1 ? (E = n, $.cssRules.length > 0 && $.deleteRule(0), Z.addStyleRule("#loadingScreen, #gameContainer", "transform-origin: 50% 0 0;-webkit-transform-origin: 50% 0 0;-moz-transform-origin: 50% 0 0;-ms-transform-origin: 50% 0 0;-o-transform-origin: 50% 0 0;transform: scale(" + n + ");" + "-webkit-transform: scale(" + n + ");" + "-moz-transform: scale(" + n + ");" + "-ms-transform: scale(" + n + ");" + "-o-transform: scale(" + n + ");", $)) : n != E && Z.isScaled() && (E = null, $.cssRules.length > 0 && $.deleteRule(0))
    }

    function K() {
        var t = e("#styleSheet");
        t.length > 0 && e(t).remove(), w = Q("styleSheet")
    }

    function Q(e) {
        return style = document.createElement("style"), e && (style.id = e), style.appendChild(document.createTextNode("")), document.head.appendChild(style), style.sheet
    }

    function G() {
        e("body").addClass("hyperspace"), setTimeout(function () {
            e("body").removeClass("hyperspace")
        }, 1e3)
    }

    function Y(t) {
        e("body").toggleClass("paused", t)
    }
    var c = 14,
        h = 10,
        p = 600,
        d = 650,
        v = 725,
        m, g = null,
        y = null,
        b = null,
        w = null,
        E = null,
        S = {
            total: 0,
            big: 0
        },
        x = !1,
        T = !1,
        N = function (e, t) {
            window.setTimeout(e, 1e3 / 60)
        },
        C = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.onRequestAnimationFrame || window.msRequestAnimationFrame || N
        }(),
        k = null,
        L = {},
        D = function () {
            var t = null;
            return function (n) {
                var r;
                t == null ? (t = Z.make().attr("id", "endGame"), t.append(e("<h2>").text(m.get("CLEAR"))), t.append(e("<ul>").addClass("menu").append(e("<li>").text(m.get("CONTINUE")).on("click touchstart", H)).append(e("<li>").text(m.get("NEWGAMEPLUS")).on("click touchstart", B))), r = e("<ul>").addClass("counts").appendTo(t), Z.get("body").append(t), t.css("left")) : (r = e("ul.list", t), n && r.empty());
                if (n)
                    for (var i in n) r.append(e("<li>").append(e("<span>").text(m.get(i) || 0)).append(e("<span>").text(n[i])));
                return t
            }
        }(),
        $ = null,
        Z = {
            init: function (r) {
                loaded = !1, T = !1, b = null, e("body").removeClass("night").toggleClass("ios", r.ios), r.ios && (C = N), m = new n, K(), J(), e(window).off("resize").on("resize", J), t.bind("draw", M), t.bind("pause", Y.bind(this, !0)), t.bind("unpause", Y.bind(this, !1)), t.bind("monsterKilled", this.monsterKilled), t.bind("newEntity", this.addToWorld), t.bind("removeEntity", this.removeFromWorld), t.bind("healthChanged", this.updateHealthBar), t.bind("dayBreak", this.handleDayBreak), t.bind("gameOver", P), t.bind("blockDown", j), t.bind("keySequenceComplete", G), t.bind("longLoad", function () {
                    Z.get("#loadingScreen").append(Z.make("longload").text(Z.getText("LONG_LOAD")).append(Z.make("nomusic", "a").text(Z.getText("NO_MUSIC")).attr("href", window.location + (window.location.search.length > 0 ? "&" : "?") + "nomusic")))
                }), i.init(), s.init(), o.init(), u.init(), a.init(), require("app/engine").isSilent() || f.init(), C(A)
            },
            isScaled: function () {
                return E != null
            },
            isReady: function () {
                return l.isReady() && m && m.isReady()
            },
            getText: function (e) {
                return m.get(e)
            },
            attachHandler: function (e, t, n, r) {
                var i = require("app/graphics/" + e.toLowerCase());
                i.attachHandler(t, n, r)
            },
            get: function (t, n, r) {
                var i = n ? n.find(t) : e(t);
                return r || i.length > 0 ? i : null
            },
            addStyleRule: function (e, t, n) {
                n = n || w;
                if (n.addRule) {
                    var r = n.cssRules.length;
                    return n.addRule(e, t), r
                }
                return n.insertRule(e + "{" + t + "}", 0)
            },
            removeStyleRule: function (e) {
                w.deleteRule(e)
            },
            remove: function (e) {
                var t = e.el ? e.el() : e;
                e.remove()
            },
            createResourceBar: function (t, n) {
                var r = e("<li>").addClass("resourceBar").addClass(t);
                return e("<div>").addClass("resourceBar-inner").appendTo(r), r
            },
            make: function (t, n) {
                return n = n || "div", e("<" + n + ">").addClass(t)
            },
            addToWorld: function (e) {
                if (e.el == null) s.add(e);
                else {
                    var t = require("app/graphics/graphics");
                    s.add(e.el()), e.p && t.setPosition(e, e.p()), t.updateSprite(e)
                }
            },
            removeFromWorld: function (e) {
                s.remove(e.el ? e.el() : e)
            },
            worldWidth: function () {
                return g == null && (g = e(".world").width()), g
            },
            worldHeight: function () {
                return y == null && (y = e(".world").height()), y
            },
            addToGame: function (t) {
                e("#gameContainer").append(t.el ? t.el() : t)
            },
            addToBoard: function (t) {
                e(".gameBoard").append(t.el ? t.el() : t)
            },
            addToMenu: function (t) {
                e(".menuBar").append(t.el ? t.el() : t)
            },
            hide: function (e) {
                (e.el ? e.el() : e).addClass("hidden")
            },
            show: function (e) {
                (e.el ? e.el() : e).removeClass("hidden")
            },
            addTilesToContainer: function (e) {
                var t = document.createDocumentFragment();
                for (var n in e) t.appendChild(e[n].el()[0]);
                document.getElementById("tileContainer").appendChild(t)
            },
            addMonster: function (e, t) {
                var n = e.el();
                e.p(t == "left" ? -n.width() : Z.worldWidth() + n.width()), e.animation(e.getAnimation(t == "right" ? "left" : "right")), O(e, e.p()), n.appendTo(".world")
            },
            moveCelestial: function (e) {
                var t = e.el(),
                    n = e.p(),
                    r = Math.abs(n - Z.worldWidth() / 2) / (Z.worldWidth() / 2) * 30,
                    i = n - t.width() / 2,
                    s = Math.floor(r);
                t.css({
                    transform: "translate3d(" + i + "px, " + s + "px, 0)",
                    "-webkit-transform": "translate3d(" + i + "px, " + s + "px, 0)",
                    "-moz-transform": "translate3d(" + i + "px, " + s + "px, 0)",
                    "-ms-transform": "translate3d(" + i + "px, " + s + "px, 0)",
                    "-o-transform": "translate3d(" + i + "px, " + s + "px, 0)"
                })
            },
            setNight: function (t) {
                t ? e("body").addClass("night") : e("body").removeClass("night")
            },
            phaseTransition: function (t, n) {
                var r = t.p() - t.el().width() / 2;
                t.el().css({
                    transform: "translate3d(" + r + "px, " + (Z.worldHeight() + 10) + "px, 0)",
                    "-webkit-transform": "translate3d(" + r + "px, " + (Z.worldHeight() + 10) + "px, 0)",
                    "-moz-transform": "translate3d(" + r + "px, " + (Z.worldHeight() + 10) + "px, 0)",
                    "-ms-transform": "translate3d(" + r + "px, " + (Z.worldHeight() + 10) + "px, 0)",
                    "-o-transform": "translate3d(" + r + "px, " + (Z.worldHeight() + 10) + "px, 0)"
                }), e("body").toggleClass("night");
                var i = this;
                setTimeout(function () {
                    e("body").hasClass("night") ? t.animation(1) : t.animation(0), t.el().addClass("noTransition"), t.el().css({
                        transform: "translate3d(0px, " + (Z.worldHeight() + 10) + "px, 0)",
                        "-webkit-transform": "translate3d(0px, " + (Z.worldHeight() + 10) + "px, 0)",
                        "-moz-transform": "translate3d(0px, " + (Z.worldHeight() + 10) + "px, 0)",
                        "-ms-transform": "translate3d(0px, " + (Z.worldHeight() + 10) + "px, 0)",
                        "-o-transform": "translate3d(0px, " + (Z.worldHeight() + 10) + "px, 0)"
                    }), setTimeout(function () {
                        t.el().removeClass("noTransition"), i.raiseCelestial(t), n != null && n()
                    }, 500)
                }, 900)
            },
            raiseCelestial: function (e) {
                e.p(15), this.moveCelestial(e)
            },
            updateCosts: function (e) {
                var t = !1;
                for (var n in e.requiredResources) {
                    var r = e.options.type.cost[n],
                        i = r - e.requiredResources[n];
                    i > 0 && (t = !0), e.el().find(".resourceBar." + n + " .resourceBar-inner").css("width", i / r * 100 + "%")
                }
                if (t) {
                    e.el().find(".resourceBars").addClass("show");
                    var s = e.getReplaces(require("app/gamestate"));
                    s && (s.el().data("upgrade", e), Z.markUpgrading(s, !0))
                }
            },
            updateSprite: function (t) {
                var n = t.el(),
                    r = (t.tempAnimation == null ? t.animationRow : t.tempAnimation) || 0;
                Z.updateSpritePos(n, t.frame * t.width(), r * t.height() + l.getOffset(t.options.spriteName));
                var i = e(".animationLayer", n);
                i && Z.updateSpritePos(i, t.frame * t.width(), r * t.height() + l.getOffset(t.options.nightSpriteName)), t.stepFunction && t.stepFunction(t.frame)
            },
            updateSpritePos: function (e, t, n) {
                e.css("background-position", -t + "px " + -n + "px")
            },
            setPosition: function (e, t) {
                e.lootable && t <= 20 && (t = 20, e.p(t)), e.lootable && t >= this.worldWidth() - 20 && (t = this.worldWidth() - 20, e.p(t)), O(e, t)
            },
            selectTile: function (e) {
                e.el().addClass("selected")
            },
            deselectTile: function (e) {
                e.el().removeClass("selected")
            },
            animateMove: function (e, t, n, r, i) {
                var s = e.el();
                L[e.guid()] = {
                    speed: i || e.speed(),
                    destination: t,
                    callback: n,
                    stopShort: r,
                    entity: e
                }
            },
            markUpgrading: function (e, t) {
                t ? e.el().addClass("upgrading") : e.el().removeClass("upgrading")
            },
            raiseBuilding: function (t, n) {
                t.options.type.isBase && e(".resources").addClass("hidden");
                var r = t.el(),
                    i = t.getReplaces(require("app/gamestate"));
                i && i.el().addClass("sunk"), e(".resourceBars", r).addClass("sunk"), r.animate({
                    bottom: 0
                }, {
                    duration: 5e3,
                    easing: "linear",
                    complete: function () {
                        t.options.type.isBase && e(".resources").removeClass("hidden"), r.find(".resourceBars").remove(), t.options.type.tileMod && _([t.options.type.tileMod], t.options.type.tileMod + t.options.type.tileLevel, t.options.type.tileMod + (t.options.type.tileLevel - 1)), n(t)
                    }
                })
            },
            sinkBuilding: function (t) {
                var n = t.el();
                e(".resourceBars", n).removeClass("sunk"), n.stop().css("bottom", "-80px");
                var r = t.getReplaces(require("app/gamestate"));
                r && r.el().removeClass("sunk")
            },
            pickUpBlock: function (e) {
                e.el().appendTo(".heldBlock")
            },
            updateBlock: function (t) {
                e("div", t.el()).width(t.quantity() / t.max * 100 + "%")
            },
            getStatusContainer: function () {
                var t = e(".statusContainer");
                return t.length == 0 && (t = e("<div>").addClass("statusContainer").append(e("<div>").addClass("hearts")).appendTo(".gameBoard")), t
            },
            updateExperience: function (t, n) {
                var r = e(".xpBar");
                r.length == 0 && (r = e("<div>").addClass("xpBar").addClass("litBorder").addClass("hidden").append(e("<div>").addClass("mask")).append(e("<div>").addClass("nightSprite")).append(e("<div>").addClass("fill").addClass("hidden")).appendTo(".gameBoard")), r.find(".fill").css("height", t / n * 100 + "%"), setTimeout(function () {
                    e(".xpBar, .fill").removeClass("hidden")
                }, 100)
            },
            numHearts: function () {
                return S.total
            },
            updateHealth: function (t, n) {
                S = F(n);
                var r = e(".hearts", this.getStatusContainer());
                for (var i = 0, s = S.total - r.children().length; i < s; i++) e("<div>").addClass("heart").addClass("prepop").append(e("<div>").addClass("mask")).append(e("<div>").addClass("mask").addClass("nightSprite")).append(e("<div>").addClass("bar")).appendTo(r);
                for (var i = S.total; i > 0; i--) {
                    var o = e(r.children()[i - 1]),
                        u = h;
                    i <= S.big && (u *= 2, o.removeClass("heart").addClass("bigheart")), t >= u ? (o.removeClass("empty"), e(".bar", o).css("width", "100%"), t -= u) : t > 0 ? (o.removeClass("empty"), e(".bar", o).css("width", t / u * 100 + "%"), t = 0) : (o.addClass("empty"), e(".bar", o).css("width", "0%"))
                }
                e(".prepop", r).each(function (t, n) {
                    setTimeout(function () {
                        e(n).detach().appendTo(r).removeClass("prepop")
                    }, t * 100)
                })
            },
            updateShield: function (t, n) {
                var r = this.getStatusContainer(),
                    i = e(".shield", r);
                i.length == 0 && (i = e("<div>").addClass("shield").addClass("prepop").append(e("<div>")).insertAfter(".hearts", r)), t > 0 ? (i.hasClass("prepop") && setTimeout(function () {
                    i.detach().insertAfter(".hearts", r).removeClass("prepop")
                }, 100), e("div", i).width(t / n * 100 + "%")) : (e("div", i).width("0%"), i.addClass("hidden"), setTimeout(function () {
                    i.addClass("prepop").removeClass("hidden")
                }, 300))
            },
            updateSword: function (t, n) {
                var r = this.getStatusContainer(),
                    i = e(".sword", r);
                i.length == 0 && (i = e("<div>").addClass("sword").addClass("prepop").append(e("<div>")).insertAfter(".hearts", r)), t > 0 ? (i.hasClass("prepop") && setTimeout(function () {
                    i.detach().insertAfter(".hearts", r).removeClass("prepop")
                }, 100), e("div", i).width(t / n * 100 + "%")) : (e("div", i).width("0%"), i.addClass("hidden"), setTimeout(function () {
                    i.addClass("prepop").removeClass("hidden")
                }, 300))
            },
            stop: function (e) {
                delete L[e.guid()]
            },
            fadeOut: function (t) {
                e(".gameBoard").addClass("hidden"), t && setTimeout(t, 1e3)
            },
            notifySave: function () {
                e(".saveSpinner").addClass("active"), setTimeout(function () {
                    e(".saveSpinner").removeClass("active")
                }, 1500)
            },
            fireArrow: function (t, n) {
                var r = t.options.fireFrom,
                    i = t.options.fireTo,
                    s = i - r,
                    o = 1e3,
                    u = t.el();
                return u.addClass(s > 0 ? "right" : "left"), u.attr("style", "transform: translateX(" + r + "px);" + "-webkit-transform: translateX(" + r + "px);" + "-moz-transform: translateX(" + r + "px);" + "-ms-transform: translateX(" + r + "px);" + "-o-transform: translateX(" + r + "px);"), e(".world").append(u), u.css("left"), u.attr("style", "transform: translateX(" + (r + s / 2) + "px);" + "-webkit-transform: translateX(" + (r + s / 2) + "px);" + "-moz-transform: translateX(" + (r + s / 2) + "px);" + "-ms-transform: translateX(" + (r + s / 2) + "px);" + "-o-transform: translateX(" + (r + s / 2) + "px);"), u.addClass("top"), setTimeout(function () {
                    u.attr("style", "transform: translateX(" + (r + s) + "px);" + "-webkit-transform: translateX(" + (r + s) + "px);" + "-moz-transform: translateX(" + (r + s) + "px);" + "-ms-transform: translateX(" + (r + s) + "px);" + "-o-transform: translateX(" + (r + s) + "px);"), u.removeClass("top").addClass("bottom"), setTimeout(function () {
                        u.remove(), n && n(u)
                    }, o / 2)
                }, o / 2), t
            },
            levelUp: function (t) {
                var n = t.p(),
                    r = e("<div>").addClass("levelEffect").css("left", n - 1 + "px").appendTo(".world");
                r.css("left"), r.css("height", "100%"), setTimeout(function () {
                    r.css({
                        width: "100%",
                        left: "0px",
                        opacity: 0
                    })
                }, 500), setTimeout(function () {
                    r.remove()
                }, 1e3)
            },
            updateHealthBar: function (e) {
                if (e.isBoss) Z.setBossHealth(e.hp(), e.getMaxHealth());
                else {
                    var t = e.el().find(".healthBar div");
                    if (t.length > 0) {
                        var n = Math.floor(e.hp() / e.getMaxHealth() * 100);
                        t.css("width", n + "%")
                    }
                }
            },
            handleDayBreak: function (t) {
                var n = Z.getText("DAY"),
                    r;
                T && (_(["clay", "cloth", "grain"], "", "dragonFight"), T = !1, Z.setBossHealth(0, 0)), setTimeout(function () {
                    r = e("<div>").addClass("dayNotifier").text(n + " " + t).appendTo(".world")
                }, 1400), setTimeout(function () {
                    e(".monster, .treasureChest").remove(), r.addClass("hidden")
                }, 3e3), setTimeout(function () {
                    r.remove()
                }, 3500)
            },
            monsterKilled: function (e) {
                e.el().find(".healthBar").addClass("hidden")
            },
            enablePlayButton: function () {
                e("#loadingScreen .saveSpinner").addClass("hidden"), Z.drawSaveSlots()
            },
            setBossHealth: function (e, t) {
                b == null && (b = Z.make("bossHealth noshow").append(Z.make()), s.add(b), b.css("left"), b.removeClass("noshow")), b.find("div").css("width", e / t * 100 + "%"), e <= 0 && (b.addClass("noshow"), setTimeout(function () {
                    b.remove(), b = null
                }, 1e3))
            },
            landDragon: function (e, n) {
                T = !0, e.setPosture("idle"), e.el().addClass("flying"), e.p(e.options.flip ? 50 : this.worldWidth() - 50), e.animation(1, !0, function (e) {
                    e == 2 && t.trigger("flap")
                }), e.setNeckMount({
                    x: 50,
                    y: 47
                }), this.addToWorld(e), e.el().css("left"), e.el().removeClass("flying");
                var r = e.options.flip ? "flipTilted" : "tilted";
                setTimeout(function () {
                    t.trigger("landDragon"), e.animation(0), e.animationOnce(2, function (t) {
                        e.setNeckMount(function () {
                            switch (t) {
                                case 0:
                                    return {
                                        x: 50,
                                        y: 47
                                    };
                                case 1:
                                    return {
                                        x: 30,
                                        y: 75
                                    };
                                case 2:
                                    return {
                                        x: 20,
                                        y: 105
                                    };
                                case 3:
                                    return null
                            }
                        }())
                    }), e.setPosture("idle", 500), i.el().addClass(r), _(["clay", "cloth", "grain"], "dragonFight", "")
                }, 1e3), setTimeout(function () {
                    Z.setBossHealth(e.hp(), e.getMaxHealth()), i.el().removeClass(r), e.setPosture("windup", 500)
                }, 1500), setTimeout(function () {
                    t.trigger("roar"), e.setPosture("roar", 500)
                }, 2e3), setTimeout(function () {
                    i.el().addClass("shaking")
                }, 2500), setTimeout(function () {
                    i.el().removeClass("shaking"), e.setPosture("idle", 500)
                }, 3500), n && setTimeout(n, 4e3)
            },
            drawSaveSlots: function () {
                var e = Z.make("saveSlots", "ul");
                for (var t = 0; t < 3; t++) {
                    var n = require("app/gamestate").getSlotInfo(t),
                        r = I(n, t);
                    e.append(r)
                }
                Z.get("#loadingScreen").append(e)
            },
            replaceSlot: function (e, t) {
                var n = I(t, e),
                    r = Z.get(".saveSlot:nth-child(" + (e + 1) + ")");
                r.before(n), r.remove()
            },
            drawSlot: I
        };
    return Z
}), define("app/action/action", ["app/graphics/graphics"], function () {
    var e = function () {};
    return e.prototype.doAction = function (e) {
        throw "Abstract Action cannot be executed!"
    }, e.prototype.terminateAction = function (e) {
        var t = require("app/graphics/graphics");
        e.makeIdle(), t.stop(e), e.action = null
    }, e.prototype.doFrameAction = function (e) {}, e.prototype.reinitialize = function (e) {
        console.log("reinitialize Action"), this.terminateAction(e), this.doAction(e)
    }, e
}), define("app/action/moveblock", ["app/action/action", "app/eventmanager"], function (e, t) {
    var n = 50,
        r = function (e) {
            this.block = e.block, this.destination = e.destination
        };
    return r.prototype = new e, r.constructor = r, r.prototype.doAction = function (e) {
        var t = this,
            r = require("app/gamestate"),
            i = require("app/gamecontent"),
            s = require("app/graphics/graphics"),
            o = require("app/eventmanager");
        this._functionQueue = [], this._currentFunction = null;
        var u = function () {
            if (t._functionQueue.length === 0) {
                e.action = null;
                return
            }
            t._currentFunction = t._functionQueue.shift(), t._currentFunction()
        };
        this._functionQueue.push(function () {
            e.move(n, u)
        }), this._functionQueue.push(function () {
            o.trigger("blockUp"), s.pickUpBlock(t.block), r.removeBlock(t.block), e.carrying = t.block, u()
        }), this._functionQueue.push(function () {
            e.move(t.destination.dudeSpot(), u)
        }), this._functionQueue.push(function () {
            e.carrying = null, t.destination.requiredResources[t.block.options.type.className]--, o.trigger("blockDown", [t.block, t.destination]), u()
        }), u()
    }, r.prototype.terminateAction = function (e) {
        var t = require("app/graphics/graphics"),
            n = require("app/resources");
        e.makeIdle(), t.stop(e), e.carrying != null && (n.returnBlock(this.block), e.carrying = null), e.action = null
    }, r.prototype.reinitialize = function (e) {
        console.log("reinitialize MoveBlock"), require("app/graphics/graphics").stop(e), this._currentFunction && this._currentFunction()
    }, r
}), define("app/action/raisebuilding", ["app/action/action", "app/gamecontent"], function (e, t) {
    var n = function (e) {
        this.building = e.building, this.hammering = !1
    };
    return n.prototype = new e, n.constructor = n, n.prototype.doAction = function (e) {
        var t = this;
        e.move(this.building.dudeSpot(), function (e) {
            e.animation(8);
            var n = require("app/world"),
                r = require("app/graphics/graphics"),
                i = require("app/gamecontent"),
                s = require("app/eventmanager");
            t.hammering = !0, r.raiseBuilding(t.building, function () {
                t.building.built = !0, s.trigger("buildingComplete", [t.building]), e.makeIdle(), e.action = null;
                var r = i.BuildingCallbacks[t.building.options.type.className];
                r && r(), t.building.options.type.replaces != null && (replaces = t.building.getReplaces(require("app/gamestate")), n.removeBuilding(replaces))
            })
        })
    }, n.prototype.doFrameAction = function (e) {
        this.hammering && e == 3 && require("app/eventmanager").trigger("bluntHit")
    }, n.prototype.terminateAction = function (e) {
        var t = this;
        require(["app/graphics/graphics"], function (n) {
            n.stop(e), e.makeIdle(), e.action = null, n.sinkBuilding(t.building)
        })
    }, n
}), define("app/action/moveto", ["app/action/action"], function (e) {
    function n(e, t) {
        return e.p() < t.p() ? "right" : "left"
    }
    var t = function (e) {
        this.target = e.target, this.useMove = e.useMove
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        var t = this;
        this._entity = e;
        var r = this.useMove ? "move" : "moveTo";
        this._dir = n(e, this.target), e[r](this.useMove ? t.target.p() : t.target, function (e) {
            e.makeIdle(), e.action == this && (e.action = null)
        }.bind(this))
    }, t.prototype.doFrameAction = function (e) {
        var t = this,
            r = require("app/world");
        if (e == 3 && this._entity == r.getDude()) {
            var i = r.findClosestMonster() || r.findClosestLoot();
            if (i == null) this.terminateAction(this._entity);
            else if (i != this.target || n(this._entity, this.target) != this._dir) this.target = i, this.doAction(this._entity)
        }
    }, t
}), define("app/action/attack", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        this._entity = e;
        var t;
        e.p() < this.target.p() ? (t = 3, this.lastDir = "right") : (t = 4, this.lastDir = "left"), e.animationOnce(t)
    }, t.prototype.doFrameAction = function (e) {
        e == 1 ? (require("app/eventmanager").trigger(this._entity.hasSword() ? "sharpHit" : "bluntHit"), this.target.takeDamage(this._entity.getDamage(), this._entity)) : e == 3 && (this._entity.action = null)
    }, t
}), define("app/action/die", ["app/action/action"], function (e) {
    var t = 5e3,
        n = function (e) {};
    return n.prototype = new e, n.constructor = n, n.prototype.doAction = function (e) {
        this._entity = e, e.animation(e.lastDir == "left" ? 6 : 5, !0), require("app/eventmanager").trigger("death")
    }, n.prototype.doFrameAction = function (e) {
        e == 3 && (this._entity.dead = !0, this._entity.action = null, this._entity.gone = !0, setTimeout(function () {
            setTimeout(function () {
                this._entity.el().remove()
            }.bind(this), 200), this._entity.el().addClass("hidden")
        }.bind(this), t))
    }, n.prototype.terminateAction = function (e, t) {
        return !1
    }, n
}), define("app/action/fastattack", ["app/action/attack"], function (e) {
    var t = function (e) {
        this.target = e.target
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doFrameAction = function (e) {
        if (e == 1 || e == 3) this.target.takeDamage(this._entity.getDamage(), this._entity), require("app/eventmanager").trigger(this._entity.hasSword() ? "sharpHit" : "bluntHit");
        e == 3 && (this._entity.action = null)
    }, t
}), define("app/entity/projectile", ["app/entity/worldentity"], function (e) {
    var t = function (e) {
        this.options = $.extend({}, this.options, e)
    };
    return t.prototype = new e({
        className: "projectile"
    }), t.constructor = t, t.prototype.el = function () {
        if (this._el == null) {
            var t = require("app/graphics/graphics");
            this._el = e.prototype.el.call(this).addClass(this.options.projectileClass).append(t.make("projectileInner"))
        }
        return this._el
    }, t
}), define("app/action/shoot", ["app/action/action", "app/entity/projectile"], function (e, t) {
    var n = function (e) {
        e && (this.target = e.target), this.arrow = null
    };
    return n.prototype = new e, n.constructor = n, n.prototype.doAction = function (e) {
        this._entity = e;
        var t;
        e.p() < this.target.p() ? (t = 3, this.lastDir = "right") : (t = 4, this.lastDir = "left"), e.animationOnce(t)
    }, n.prototype.doFrameAction = function (e) {
        if (e == 3) {
            require("app/eventmanager").trigger(this._entity.options.fire ? "shootFire" : "shoot");
            var n = require("app/graphics/graphics"),
                r = this._entity.p(),
                i = this.target.p(),
                s = this,
                o = new t({
                    projectileClass: this._entity.options.arrowClass,
                    speed: this._entity.options.arrowSpeed,
                    fireFrom: r,
                    fireTo: i
                });
            n.fireArrow(o, function () {
                Math.abs(i - s.target.p()) <= 5 && (require("app/eventmanager").trigger(s._entity.options.fire ? "explodeFire" : "sharpHit"), s.target.takeDamage(s._entity.getDamage(), s._entity))
            }), this._entity.action = null
        }
    }, n
}), define("app/action/getloot", ["app/action/action", "app/eventmanager"], function (e, t) {
    var n = function (e) {
        this.target = e.target
    };
    return n.prototype = new e, n.constructor = n, n.prototype.doAction = function (e) {
        this._entity = e, e.animationOnce(10)
    }, n.prototype.doFrameAction = function (e) {
        if (e == 3) {
            t.trigger("pickupLoot", [this.target, require("app/world").getDebugMultiplier()]), this._entity.action = null, this._entity.paused = !0;
            var n = this._entity;
            setTimeout(function () {
                n.paused = !1
            }, 1500)
        }
    }, n.prototype.terminateAction = function (t) {
        e.prototype.terminateAction.call(this, t), t.paused = !1
    }, n
}), define("app/action/climb", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        this._entity = e, e.animationOnce(7)
    }, t.prototype.doFrameAction = function (e) {
        e == 0 && this.complete ? this._entity.action = null : e == 3 && (this.complete = !0)
    }, t
}), define("app/action/lichspell", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        this._entity = e;
        var t;
        e.p() < this.target.p() ? (t = 7, this.lastDir = "right") : (t = 8, this.lastDir = "left"), e.animationOnce(t)
    }, t.prototype.doFrameAction = function (e) {
        e == 3 && (require("app/gameboard").addEffectRandomly("explosive"), require("app/eventmanager").trigger("lichSpell"), this._entity.action = null)
    }, t
}), define("app/action/teleport", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        this._entity = e, e.animationOnce(e.getAnimation(e.lastDir))
    }, t.prototype.doFrameAction = function (e) {
        switch (e) {
            case 0:
                this._entity.el().addClass("hidden"), this._entity.hidden = !0, require("app/eventmanager").trigger("teleport");
                break;
            case 2:
                var t = require("app/graphics/graphics"),
                    n = t.worldWidth();
                this.target.p() < n / 2 ? this._entity.p(n - 30) : this._entity.p(30), t.setPosition(this._entity, this._entity.p());
                break;
            case 3:
                this._entity.el().removeClass("hidden"), this._entity.hidden = !1, this._entity.action = null
        }
    }, t.prototype.terminateAction = function (t) {
        t.el().removeClass("hidden"), t.hidden = !1, e.prototype.terminateAction.call(this, t)
    }, t
}), define("app/action/dragon/land", ["app/action/action"], function (e) {
    var t = function () {};
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        e.hostile = !1, require("app/graphics/graphics").landDragon(e, function () {
            e.hostile = !0, e.action = null
        })
    }, t
}), define("app/action/dragon/bite", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target), this.timeouts = []
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        e.setPosture("aimbite", 600), this.timeouts.push(setTimeout(function () {
            e.setPosture("bite", 200)
        }, 600));
        var t = this.target;
        this.timeouts.push(setTimeout(function () {
            e.distanceFrom(t) < 5 && (t.takeDamage(e.getDamage(), e), require("app/eventmanager").trigger("sharpHit")), e.action = null
        }, 800))
    }, t.prototype.terminateAction = function (e) {
        for (var t in this.timeouts) clearTimeout(this.timeouts[t])
    }, t
}), define("app/action/dragon/fireball", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        e.setPosture("aim", 500);
        var t = this;
        this.timeout = setTimeout(function () {
            var n = require("app/graphics/graphics"),
                r = -e.absHeadPos.r,
                i = -Math.sqrt(Math.pow(t.target.p() - e.absHeadPos.x, 2) + Math.pow(e.absHeadPos.y, 2));
            e.setPosture("shoot", 200), t.projectile = n.make("dragonFireball").css({
                top: e.absHeadPos.y,
                left: e.absHeadPos.x,
                transform: "rotate(" + r + "deg) translateX(0)"
            }), n.addToWorld(t.projectile), t.projectile.css("left"), t.projectile.css("transform", "rotate(" + r + "deg) translateX(" + i + "px)"), require("app/eventmanager").trigger("shootFire"), setTimeout(function () {
                t.projectile.remove();
                var r = n.make("fireBoom").css("transform", "translateX(" + t.target.p() + "px)");
                require("app/eventmanager").trigger("explodeFire"), n.addToWorld(r), r.css("left"), r.addClass("exploded"), setTimeout(function () {
                    r.remove()
                }, 400), t.terminated || (e.action = null), t.target.takeDamage(e.getFireballDamage(), e)
            }, 300)
        }, 500)
    }, t.prototype.terminateAction = function (t) {
        this.terminated = !0, clearTimeout(this.timeout), e.prototype.terminateAction.call(this, t)
    }, t
}), define("app/action/dragon/wingbuffet", ["app/action/action"], function (e) {
    function n(e, t, n) {
        if (t == 1) switch (n) {
            case 0:
                return e.setNeckMount({
                    x: 25,
                    y: 105
                });
            case 1:
                return e.setNeckMount({
                    x: 37,
                    y: 65
                });
            case 2:
            case 3:
                return e.setNeckMount({
                    x: 65,
                    y: 46
                })
        } else if (t == 2) switch (n) {
            case 0:
                return e.setNeckMount({
                    x: 65,
                    y: 70
                });
            case 1:
                return e.setNeckMount({
                    x: 30,
                    y: 80
                });
            case 2:
                return e.setNeckMount();
            case 3:
                return e.setNeckMount({
                    x: 25,
                    y: 105
                })
        } else e.setNeckMount()
    }
    var t = function (e) {
        this.state = 0, this.target = e ? e.target : null
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        this.entity = e, e.animationOnce(3)
    }, t.prototype.doFrameAction = function (e) {
        e == 0 ? this.state == 0 ? this.state = 1 : this.state == 1 ? (this.state = 2, this.entity.animationOnce(4)) : this.state == 2 && (this.entity.action = null, this.state = 3) : e == 3 && this.state == 1 && (require("app/eventmanager").trigger("flap"), require("app/world").hasEffect("frozen") || (this.target.action && this.target.action.terminateAction(this.target), this.target.action = require("app/action/actionfactory").getAction("Slide", {
            flipped: this.entity.options.flip
        }), this.target.action.doAction(this.target)), require("app/world").removeAllEffects("fire")), n(this.entity, this.state, e)
    }, t
}), define("app/action/slide", ["app/action/action"], function (e) {
    var t = function (e) {
        this.flipped = e && e.flipped
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        var t = require("app/graphics/graphics"),
            n = e.p() + (this.flipped ? 150 : -150);
        n > t.worldWidth() - 10 && (n = t.worldWidth() - 10), n < 10 && (n = 10), t.animateMove(e, n, function () {
            e.action = null
        }, null, 1)
    }, t.prototype.terminateAction = function (t, n) {
        n && e.prototype.terminateAction.call(this)
    }, t
}), define("app/action/dragon/icebeam", ["app/action/action"], function (e) {
    var t = function (e) {
        e && (this.target = e.target)
    };
    return t.prototype = new e, t.constructor = t, t.prototype.doAction = function (e) {
        var t = require("app/graphics/graphics").make("iceBeam");
        e.setPosture("aimClose", 100);
        var n = this;
        this.timeout = setTimeout(function () {
            var r = require("app/eventmanager");
            e.setPosture("aimOpen", 500), e.getHead().append(t), r.trigger("charge"), setTimeout(function () {
                var e = require("app/gamecontent");
                r.trigger("newStateEffect", [e.StateEffects.frozen]), r.trigger("ice")
            }, 800), setTimeout(function () {
                t.remove(), n.terminated || (e.action = null)
            }, 1e3)
        }, 100)
    }, t.prototype.terminateAction = function (t) {
        this.terminated = !0, clearTimeout(this.timeout), e.prototype.terminateAction.call(this, t)
    }, t
}), define("app/action/dragon/fireblast", ["app/action/action"], function (e) {
    var t = 1e4,
        n = 2,
        r = 200,
        i = function (e) {
            e && (this.target = e.target)
        };
    return i.prototype = new e, i.constructor = i, i.prototype.doAction = function (e) {
        var i = require("app/graphics/graphics");
        e.setPosture("aimClose", 100);
        var s = this;
        this.timeout = setTimeout(function () {
            var o = Math.sqrt(Math.pow(s.target.p() - e.absHeadPos.x, 2) + Math.pow(e.absHeadPos.y, 2)),
                u = i.make("fireBlast").css("width", o - 60 + "px");
            e.setPosture("aimOpen", 500), e.getHead().append(u), require("app/eventmanager").trigger("charge"), setTimeout(function () {
                var o = i.make("fireBoom").css("transform", "translateX(" + s.target.p() + "px)");
                i.addToWorld(o), o.css("left"), o.addClass("exploded"), setTimeout(function () {
                    o.remove()
                }, 400), u.remove(), s.terminated || (e.action = null), s.target.takeDamage(e.getFireBlastDamage(), e);
                var a = new(require("app/entity/worldeffect"))({
                    effectClass: "fire",
                    spriteName: "dragoneffects",
                    row: 1,
                    animationFrames: 4,
                    effect: function () {
                        a.lastBurn = a.lastBurn || 0, Math.abs(s.target.p() - a.p()) < a.width() / 2 && a.lastBurn < Date.now() - r && (a.lastBurn = Date.now(), require("app/eventmanager").trigger("burn"), s.target.takeDamage(n, e), require("app/world").hasEffect("frozen") && require("app/eventmanager").trigger("endStateEffect", [require("app/gamecontent").StateEffects.frozen]))
                    }
                });
                a.p(s.target.p()), require("app/eventmanager").trigger("newEntity", [a]), setTimeout(function () {
                    require("app/eventmanager").trigger("removeEntity", [a])
                }, t)
            }, 1e3)
        }, 100)
    }, i.prototype.terminateAction = function (t) {
        this.terminated = !0, clearTimeout(this.timeout), e.prototype.terminateAction.call(this, t)
    }, i
}), define("app/action/dragon/die", ["app/action/action"], function (e) {
    var t = 400,
        n = function (e) {};
    return n.prototype = new e, n.constructor = n, n.prototype.doAction = function (e) {
        this._entity = e, e.hostile = !1;
        var n = "up";
        (function r() {
            setTimeout(r, t), e.setPosture("thrash" + n, t), n = n == "up" ? "down" : "up"
        })(), setTimeout(function () {
            e.explode(800)
        }, 1500)
    }, n
}), define("app/action/actionfactory", ["app/action/moveblock", "app/action/raisebuilding", "app/action/moveto", "app/action/attack", "app/action/die", "app/action/fastattack", "app/action/shoot", "app/action/getloot", "app/action/climb", "app/action/lichspell", "app/action/teleport", "app/action/dragon/land", "app/action/dragon/bite", "app/action/dragon/fireball", "app/action/dragon/wingbuffet", "app/action/slide", "app/action/dragon/icebeam", "app/action/dragon/fireblast", "app/action/dragon/die"], function (e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y) {
    return {
        _actions: {
            MoveBlock: e,
            RaiseBuilding: t,
            MoveTo: n,
            Attack: r,
            FastAttack: s,
            Shoot: o,
            Die: i,
            GetLoot: u,
            Climb: a,
            LichSpell: f,
            Teleport: l,
            Land: c,
            Bite: h,
            Fireball: p,
            WingBuffet: d,
            Slide: v,
            IceBeam: m,
            FireBlast: g,
            DragonDie: y
        },
        getAction: function (e, t) {
            var n = this._actions[e];
            return n != null ? new n(t) : null
        }
    }
}), define("app/entity/monster/monster", ["app/entity/worldentity", "app/graphics/graphics"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({
            multiplier: 1
        }, this.options, e), this.hostile = !0, this.action = null, this.noIdle = !0
    };
    return n.prototype = new e({
        className: "monster"
    }), n.prototype.el = function () {
        return this._el == null && (this._el = e.prototype.el.call(this).addClass(this.options.monsterClass).append(t.make("healthBar").append(t.make()))), this._el
    }, n.prototype.makeIdle = function () {}, n.prototype.forceDrop = !1, n.prototype.getLoot = function () {
        return null
    }, n.prototype.getMaxHealth = function () {
        var e = require("app/gameoptions").get("casualMode", !1),
            t = this.maxHealth * this.options.multiplier;
        return e && (t = Math.ceil(t / 2)), t
    }, n.prototype.getDamage = function () {
        var e = require("app/gameoptions").get("casualMode", !1),
            t = this.damage * this.options.multiplier;
        return e && (t = Math.ceil(t / 2)), t
    }, n.prototype.getXp = function () {
        return this.xp
    }, n.prototype.speed = function () {
        return this.options.speed / 2
    }, n.constructor = n, n
}), define("app/entity/monster/zombie", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 4, this.damage = 1, this.xp = 2, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "zombie",
        spriteName: "zombie",
        speed: 80
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Attack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/rat", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 2, this.damage = 1, this.xp = 4, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "rat",
        spriteName: "rat",
        speed: 20
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("FastAttack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/skeleton", ["app/entity/monster/monster", "app/action/actionfactory", "app/graphics/graphics"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 1, this.damage = 3, this.xp = 3, this.hp(this.getMaxHealth())
    };
    return r.prototype = new e({
        monsterClass: "skeleton",
        spriteName: "skeleton",
        arrowClass: "arrow",
        speed: 50,
        arrowSpeed: 7
    }), r.constructor = r, r.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Shoot", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, r.prototype.attackRange = function (e) {
        return this.p() > 10 && this.p() < n.worldWidth() - 10 && Math.abs(this.p() - e.p()) <= 200
    }, r
}), define("app/entity/monster/hauntedarmour", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 7, this.damage = 1, this.xp = 10, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "hauntedArmour",
        spriteName: "harmour",
        speed: 80
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Attack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n.prototype.hasSword = function () {
        return !0
    }, n.prototype.getHitboxWidth = function () {
        return 20
    }, n
}), define("app/entity/monster/lizardman", ["app/entity/monster/monster", "app/action/actionfactory", "app/graphics/graphics"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 3, this.damage = 4, this.xp = 13, this.hp(this.getMaxHealth())
    };
    return r.prototype = new e({
        monsterClass: "lizardman",
        spriteName: "lizardman",
        arrowClass: "arrow",
        speed: 50,
        arrowSpeed: 7
    }), r.constructor = r, r.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Shoot", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, r.prototype.attackRange = function (e) {
        return this.p() > 10 && this.p() < n.worldWidth() - 10 && Math.abs(this.p() - e.p()) <= 200
    }, r
}), define("app/entity/monster/spider", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.hostile = !0, this.action = null, this.maxHealth = 4, this.damage = 1, this.xp = 16, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "spider",
        spriteName: "spider",
        speed: 20
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("FastAttack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/earthelemental", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 24, this.damage = 1, this.xp = 20, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "earthElemental",
        spriteName: "earthelemental",
        speed: 80
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Attack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/fireelemental", ["app/entity/monster/monster", "app/action/actionfactory", "app/graphics/graphics"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.damage = 4, this.maxHealth = 12, this.xp = 27, this.hp(this.getMaxHealth())
    };
    return r.prototype = new e({
        monsterClass: "fireElemental",
        spriteName: "fireelemental",
        arrowClass: "arrow fireball",
        speed: 50,
        arrowSpeed: 7,
        fire: !0
    }), r.constructor = r, r.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Shoot", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, r.prototype.attackRange = function (e) {
        return this.p() > 10 && this.p() < n.worldWidth() - 10 && Math.abs(this.p() - e.p()) <= 200
    }, r
}), define("app/entity/monster/waterelemental", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.hostile = !0, this.action = null, this.maxHealth = 18, this.damage = 2, this.xp = 34, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "waterElemental",
        spriteName: "waterelemental",
        speed: 15
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("FastAttack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n.prototype.hasSword = function () {
        return !0
    }, n
}), define("app/entity/monster/demon", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 45, this.damage = 3, this.xp = 35, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "demon",
        spriteName: "demon",
        speed: 80
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Attack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/warlock", ["app/entity/monster/monster", "app/action/actionfactory", "app/graphics/graphics"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 18, this.damage = 5, this.xp = 43, this.hp(this.getMaxHealth())
    };
    return r.prototype = new e({
        monsterClass: "warlock",
        spriteName: "warlock",
        arrowClass: "arrow fireball",
        speed: 50,
        arrowSpeed: 7
    }), r.constructor = r, r.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("Shoot", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, r.prototype.attackRange = function (e) {
        return this.p() > 10 && this.p() < n.worldWidth() - 10 && Math.abs(this.p() - e.p()) <= 200
    }, r
}), define("app/entity/monster/imp", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    var n = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.hostile = !0, this.action = null, this.maxHealth = 36, this.damage = 2, this.xp = 52, this.hp(this.getMaxHealth())
    };
    return n.prototype = new e({
        monsterClass: "imp",
        spriteName: "imp",
        speed: 15
    }), n.constructor = n, n.prototype.think = function () {
        var e = this,
            n = require("app/world");
        if (e.isIdle() && e.isAlive() && e.action == null) {
            e.attackRange(n.getDude()) ? e.action = t.getAction("FastAttack", {
                target: n.getDude()
            }) : e.action = t.getAction("MoveTo", {
                target: n.getDude()
            });
            if (e.action != null) return e.action.doAction(e), !0
        }
        return !1
    }, n
}), define("app/entity/monster/lich", ["app/entity/monster/monster", "app/action/actionfactory", "app/graphics/graphics"], function (e, t, n) {
    var r = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.maxHealth = 120, this.damage = 5, this.xp = 500, this.dropChance = .25, this.hp(this.getMaxHealth()), this.spellCooldown = 16, this.teleportCooldown = 52
    };
    return r.prototype = new e({
        monsterClass: "lich",
        spriteName: "lich",
        speed: 100
    }), r.constructor = r, r.prototype.think = function () {
        var e = require("app/world");
        if (this.isAlive() && this.spellCooldown-- == 0) return this.spellCooldown = 24, this.action && this.action.terminateAction(this), this.action = t.getAction("LichSpell", {
            target: e.getDude()
        }), this.action.doAction(this), !0;
        if (this.isAlive() && this.teleportCooldown-- == 0) return this.teleportCooldown = 80, this.action && this.action.terminateAction(this), this.action = t.getAction("Teleport", {
            target: e.getDude()
        }), this.action.doAction(this), !0;
        if (this.isIdle() && this.isAlive() && this.action == null) {
            this.attackRange(e.getDude()) ? this.action = t.getAction("Attack", {
                target: e.getDude()
            }) : this.action = t.getAction("MoveTo", {
                target: e.getDude()
            });
            if (this.action != null) return this.action.doAction(this), !0
        }
        return !1
    }, r.prototype.getLoot = function () {
        return "callDragon"
    }, r.prototype.getHitboxWidth = function () {
        return 5
    }, r
}), define("app/entity/monster/dragon", ["app/entity/monster/monster", "app/action/actionfactory"], function (e, t) {
    function l(e, t, n) {
        var r = n ? -t[0] : t[0],
            i = n ? -t[1] : t[1],
            s = "rotate(" + r + "deg) translateX(" + i + "px)";
        e.css({
            transform: s,
            "-webkit-transform": s,
            "-moz-transform": s,
            "-ms-transform": s,
            "-o-transform": s
        })
    }

    function c(e) {
        return e * Math.PI / 180
    }

    function h(e) {
        return e * 180 / Math.PI
    }

    function p(e, t) {
        var n = c(t);
        return {
            x: e.x * Math.cos(n) - e.y * Math.sin(n),
            y: e.x * Math.sin(n) + e.y * Math.cos(n),
            r: e.r + t
        }
    }

    function d(e, t, n) {
        return {
            x: e.x + t,
            y: e.y + n,
            r: e.r
        }
    }

    function v(e, t) {
        var n = Math.abs(e.x - t.x),
            r = Math.abs(e.y - t.y),
            i = Math.atan(r / n);
        return (this.options.flip ? 1 : -1) * e.r - h(i)
    }

    function m(e) {
        var t = require("app/graphics/graphics").make("segmentExplosion").appendTo(e);
        e.addClass("gone"), t.css("left"), t.addClass("exploded"), setTimeout(function () {
            e.remove()
        }, 400)
    }
    var n = 5,
        r = 2,
        i = null,
        s = {
            x: 20,
            y: 97
        },
        o = {
            stretch: ["close", [0, -10], [0, -10], [0, -10], [0, -10]],
            idle: ["close", [80, -10], [15, -10], [-50, -10], [-50, -10]],
            windup: ["close", [100, -14], [20, -14], [-100, -10], [-19, -10]],
            roar: ["open", [40, -14], [0, -14], [0, -14], [-22, -8]],
            aim: ["close", [80, -10], [15, -10], [-50, -10], ["target", -10]],
            aimClose: ["close-fast", [80, -10], [15, -10], [-50, -10], ["target", -10]],
            aimOpen: ["open", [80, -10], [15, -10], [-50, -10], ["target", -10]],
            shoot: ["open-fast", [80, -10], [15, -10], [-50, -10], ["target", -5]],
            aimbite: ["open", [80, -17], [-30, -15], [-30, -15], ["target", -10]],
            bite: ["close-fast", [65, -17], [-62, -17], [-23, -15], ["target", -15]],
            thrashup: ["open", [20, -10], [20, -10], [20, -10], [20, -10]],
            thrashdown: ["open", [-20, -10], [-20, -10], [-20, -10], [-20, -10]]
        },
        u = null,
        a = null,
        f = null,
        g = function (e) {
            this.options = $.extend({}, this.options, {}, e), this.maxHealth = 1e3, this.damage = 4, this.xp = 5e3, this.hp(this.getMaxHealth()), this.headFrame = 0, this.headState = "close", this.target = this.options.target, this.attackQueue = [], this.uninterruptable = !0, this.isBoss = !0;
            if (!i) {
                var t = document.createElement("style");
                t.appendChild(document.createTextNode("")), document.head.appendChild(t), i = t.sheet
            }
        };
    return g.prototype = new e({
        monsterClass: "dragon",
        spriteName: "dragon",
        speed: 80,
        animationFrames: 4
    }), g.constructor = g, g.prototype.el = function () {
        if (this._el == null) {
            var t = require("app/graphics/graphics");
            this._segments = [], this._el = e.prototype.el.call(this), this.options.flip && this._el.addClass("flip"), this._segments.push(t.make("neck").appendTo(this._el)), this._segments.push(t.make("neck").appendTo(this._segments[0])), this._segments.push(t.make("neck").appendTo(this._segments[1])), this._segments.push(t.make("head").appendTo(this._segments[2]))
        }
        return this._el
    }, g.prototype.die = function () {
        this.action != null && this.action.terminateAction(this), this.action = require("app/action/actionfactory").getAction("DragonDie"), this.action.doAction(this)
    }, g.prototype.getHead = function () {
        return this._segments[3]
    }, g.prototype.headHeight = function () {
        return a || (a = this._segments[3].height()), a
    }, g.prototype.headWidth = function () {
        return u || (u = this._segments[3].width()), u
    }, g.prototype.width = function () {
        return f || (f = this.el().width()), f
    }, g.prototype.animate = function () {
        e.prototype.animate.call(this);
        var t = 1;
        this.animateHead != null && this.animateHead.indexOf("-fast") > 0 && (this.animateHead = this.animateHead.substring(0, this.animateHead.indexOf("-fast")), t = 2);
        if (this.animateHead != null && this.animateHead != this.headState) {
            this.animateHead == "open" && (this.headFrame += t) >= 2 ? (this.animateHead = null, this.headState = this.animateHead, this.headFrame = 2) : this.animateHead == "close" && (this.headFrame -= t) <= 0 && (this.animateHead = null, this.headState = this.animateHead, this.headFrame = 0);
            var n = this.options.flip ? this.headHeight() : 0;
            n += require("app/graphics/sprites").getOffset("dragonhead"), require("app/graphics/graphics").updateSpritePos(this._segments[3], this.headWidth() * this.headFrame, n)
        }
    }, g.prototype.animation = function (t, r, i) {
        t += this.options.flip ? n : 0, e.prototype.animation.call(this, t, r, i)
    }, g.prototype.animationOnce = function (t, r) {
        t += this.options.flip ? n : 0, e.prototype.animationOnce.call(this, t, r)
    }, g.prototype.setNeckMount = function (e) {
        e = e || s;
        var t = {
            top: e.y + "px"
        };
        this.options.flip ? t.right = e.x + "px" : t.left = e.x + "px", this._segments[0].css(t)
    }, g.prototype.think = function () {
        if (this.isIdle() && this.isAlive() && this.action == null) {
            this.attackQueue.length > 0 ? this.action = t.getAction(this.attackQueue.splice(0, 1), {
                target: this.target
            }) : this.target.isAlive() && this.distanceFrom(this.target) < 5 ? this.action = t.getAction("Bite", {
                target: this.target
            }) : this.target.isAlive() && (this.action = t.getAction("Fireball", {
                target: this.target
            }));
            if (this.action != null) return this.action.doAction(this), !0;
            this.setPosture("idle", 1e3)
        }
        return !1
    }, g.prototype.takeDamage = function (t) {
        t -= r, e.prototype.takeDamage.call(this, t < 0 ? 0 : t)
    }, g.prototype.queueAttack = function (e) {
        this.attackQueue.push(e)
    }, g.prototype.getFireballDamage = function () {
        return 4
    }, g.prototype.getFireBlastDamage = function () {
        return this.getFireballDamage()
    }, g.prototype.explode = function (e) {
        var t = this,
            n = t._segments.length - 1;
        (function r() {
            m(t._segments[n]), require("app/eventmanager").trigger("segmentExplode"), n-- > 0 ? setTimeout(r, e) : setTimeout(function () {
                require("app/eventmanager").trigger("dragonExplode");
                var e = require("app/graphics/graphics").make("dragonExplosion").appendTo(t.el());
                e.css("left"), e.addClass("exploded"), require("app/world").gameOver(), t.el().addClass("gone"), setTimeout(function () {
                    e.remove(), t.el().remove(), t.dead = !0, t.action = null, t.gone = !0
                }, 2e3)
            }, e)
        })()
    }, g.prototype.setPosture = function (e, t) {
        if (this.currentPosture == null || this.currentPosture != e) {
            this.currentPosture = e;
            var n = o[e];
            if (n) {
                i.cssRules.length > 0 && i.deleteRule(0), i.addRule ? i.addRule(".dragon .neck, .dragon .head", "transition-duration: " + t + "ms", 0) : i.insertRule(".dragon .neck, .dragon .head {transition-duration: " + t + "ms; }", 0);
                var r = {
                        x: 0,
                        y: 0,
                        r: 0
                    },
                    u = null;
                for (var a = this._segments.length; a > 0; a--) {
                    var f;
                    isNaN(n[a][0]) ? (f = 0, u = n[a]) : (l(this._segments[a - 1], n[a], this.options.flip), f = n[a][0]), a < this._segments.length && (r = d(p(r, f * (this.options.flip ? -1 : 1)), n[a][1] * (this.options.flip ? -1 : 1), 0))
                }
                var c = this.el().position();
                this.animateHead = n[0];
                var h;
                this.options.flip ? h = c.left + this.width() - s.x + r.x - 20 : h = s.x + c.left + r.x + 10, this.absHeadPos = {
                    x: h,
                    y: s.y + c.top + r.y,
                    r: r.r
                };
                if (u != null) {
                    var m = [v.call(this, this.absHeadPos, {
                        x: this.target.p(),
                        y: require("app/graphics/graphics").worldHeight() - this.target.height()
                    }), u[1]];
                    l(this._segments[this._segments.length - 1], m, this.options.flip), this.options.flip ? this.absHeadPos.r = 180 + m[0] - r.r : this.absHeadPos.r = -m[0] - r.r
                }
                setTimeout(function () {
                    i.cssRules.length > 0 && i.deleteRule(0)
                }, t)
            }
        }
    }, g
}), define("app/entity/monster/monsterfactory", ["app/entity/monster/zombie", "app/entity/monster/rat", "app/entity/monster/skeleton", "app/entity/monster/hauntedarmour", "app/entity/monster/lizardman", "app/entity/monster/spider", "app/entity/monster/earthelemental", "app/entity/monster/fireelemental", "app/entity/monster/waterelemental", "app/entity/monster/demon", "app/entity/monster/warlock", "app/entity/monster/imp", "app/entity/monster/lich", "app/entity/monster/dragon"], function (e, t, n, r, i, s, o, u, a, f, l, c, h, p) {
    return {
        _monsters: {
            zombie: e,
            rat: t,
            skeleton: n,
            hauntedArmour: r,
            lizardman: i,
            spider: s,
            earthElemental: o,
            fireElemental: u,
            waterElemental: a,
            demon: f,
            warlock: l,
            imp: c,
            lich: h,
            dragon: p
        },
        getMonster: function (e, t) {
            var n = this._monsters[e];
            return n != null ? new n(t) : null
        }
    }
}), define("app/entity/gem", ["app/entity/worldentity"], function (e) {
    var t = function () {};
    return t.prototype = new e({
        className: "gem",
        spriteName: "gem"
    }), t.constructor = t, t
}), define("app/entity/celestial", ["app/entity/worldentity"], function (e) {
    var t = function () {};
    return t.prototype = new e({
        className: "celestial",
        spriteName: "sun"
    }), t.constructor = t, t
}), define("app/entity/dude", ["app/eventmanager", "app/entity/worldentity", "app/graphics/graphics", "app/gamestate", "app/action/actionfactory", "app/gamecontent"], function (e, t, n, r, i, s) {
    var o = 26,
        u = function () {
            this._el = null, this.carrying = null, this.action = null, n.updateHealth(r.health, r.maxHealth()), n.updateExperience(r.xp, this.toLevel()), this.shield = 0, this.sword = 0
        };
    return u.prototype = new t({
        className: "dude",
        spriteName: "dude",
        nightSpriteName: "dudenight"
    }), u.constructor = u, u.prototype.el = function () {
        return this._el == null && (this._el = t.prototype.el.call(this).append(n.make("animationLayer nightSprite")), this.held = n.make("heldBlock").appendTo(this._el)), this._el
    }, u.prototype.isAlive = function () {
        return r.health > 0
    }, u.prototype.getAnimation = function (e) {
        return e == "right" && this.carrying != null ? 9 : t.prototype.getAnimation.call(this, e)
    }, u.prototype.think = function () {
        if (this.isIdle() && this.action == null) {
            var e = require("app/world").getActivity();
            if (e != null) return this.action = e, this.action.doAction(this), !0
        }
        return !1
    }, u.prototype.gainXp = function (t) {
        t = t || 0, r.xp += t, isNaN(r.xp) && (r.xp = 0);
        while (r.xp >= this.toLevel()) r.level >= o ? r.xp = this.toLevel() - 1 : (r.xp -= this.toLevel(), r.level++, r.counts.LEVEL = r.level, n.levelUp(this), r.health = r.maxHealth(), n.updateHealth(r.health, r.maxHealth()), e.trigger("levelUp", [r.level]), this.action != null && this.action.terminateAction(this));
        n.updateExperience(r.xp, this.toLevel())
    }, u.prototype.toLevel = function () {
        return 40 * Math.pow(r.level, 2)
    }, u.prototype.heal = function (e) {
        r.health += e, r.health = r.health > r.maxHealth() ? r.maxHealth() : r.health, n.updateHealth(r.health, r.maxHealth())
    }, u.prototype.getDamage = function () {
        var e = r.level < 7 ? 1 : Math.floor((r.level - 1) / 3);
        return this.sword > 0 ? (this.sword--, n.updateSword(this.sword, r.maxSword()), r.swordDamage() + e) : e
    }, u.prototype.takeDamage = function (t, i) {
        if (r.health > 0) {
            require("app/world").hasEffect("frozen") && (t /= 2);
            if (this.shield > 0) {
                var s = t > this.shield ? this.shield : t;
                this.shield -= s, t -= s, n.updateShield(this.shield, r.maxShield())
            }
            r.health -= t, r.health = r.health < 0 ? 0 : r.health, r.health == 0 && this.action && this.action.terminateAction(this), r.health == 0 && e.trigger("dudeDeath", [i ? i.options.monsterClass : "unknown"]), n.updateHealth(r.health, r.maxHealth())
        }
    }, u.prototype.animate = function () {
        t.prototype.animate.call(this), this.carrying != null && (this.frame == 1 ? this.held.css({
            transform: "translate3d(0px, 1px, 0px)"
        }) : this.frame == 3 ? this.held.css({
            transform: "translate3d(0px, -1px, 0px)"
        }) : this.held[0].style = "")
    }, u.prototype.animationOnce = function (e) {
        (e == 3 || e == 4) && this.sword == 0 && (e += 8), t.prototype.animationOnce.call(this, e)
    }, u.prototype.speed = function () {
        var e = require("app/world"),
            t = this.options.speed / e.getDebugMultiplier();
        return e.hasEffect("haste") ? t / 8 : t / 2
    }, u.prototype.hasSword = function () {
        return this.sword > 0
    }, u
}), define("app/entity/star", ["app/entity/worldentity"], function (e) {
    var t = function () {};
    return t.prototype = new e({
        className: "star",
        spriteName: "star"
    }), t.constructor = t, t
}), define("app/entity/worldeffect", ["app/entity/worldentity"], function (e) {
    var t = function (e) {
        this.options = $.extend({}, this.options, {
            animationFrames: 1,
            effectClass: "blank",
            row: 0
        }, e), this.animationRow = e.row
    };
    return t.prototype = new e({
        className: "worldEffect"
    }), t.constructor = t, t.prototype.el = function () {
        return this._el || (this._el = e.prototype.el.call(this).addClass(this.options.effectClass)), this._el
    }, t.prototype.think = function () {
        this.options.effect && this.options.effect()
    }, t
}), define("app/world", ["jquery", "app/eventmanager", "app/analytics", "app/graphics/graphics", "app/entity/building", "app/gamecontent", "app/gamestate", "app/action/actionfactory", "app/entity/monster/monsterfactory", "app/entity/block", "app/entity/gem", "app/resources", "app/entity/celestial", "app/entity/dude", "app/entity/star", "app/entity/worldeffect"], function (e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v) {
    function P(e) {
        if (S) return;
        A && A == e ? (H(e), t.trigger("deprioritize")) : (L || (L = new d, t.trigger("newEntity", [L])), t.trigger("prioritize"), A = e, o.prioritizedBuilding = e.options.type.className, L.p(e.options.type.position), r.setPosition(L, L.p()), L.el().css("display", "block"))
    }

    function H(e) {
        A == e && (A = null, o.prioritizedBuilding = null, L.el().css("display", "none"))
    }

    function B(e) {
        var t = null;
        for (var n in N) {
            var r = N[n];
            (e == null || e(r) == 1) && (t == null || y.distanceFrom(r) < y.distanceFrom(t)) && (t = r)
        }
        return t
    }

    function j(e) {
        if (o.prestige && e.prestigeDependency && !o.hasBuilding(s.getBuildingType(e.prestigeDependency))) return !1;
        if (e.requiredLevel != null && o.level < e.requiredLevel) return !1;
        if (e.test && !e.test(o)) return !1;
        if (e.replaces != null) {
            var t = s.getBuildingType(e.replaces);
            if (!o.hasBuilding(t)) return !1
        }
        return !0
    }

    function F() {
        y.shield = o.maxShield(), r.updateShield(y.shield, o.maxShield())
    }

    function I() {
        y.sword = o.maxSword(), r.updateSword(y.sword, o.maxSword())
    }

    function q(e) {
        o.mana = o.mana ? o.mana + e : e, o.mana > o.maxMana() && (o.mana = o.maxMana()), t.trigger("updateMana", [o.mana, o.maxMana()])
    }

    function R(e, t, n) {
        var i = a.getMonster(e, {
            tiles: t,
            multiplier: o.prestige * m + 1
        });
        return r.addMonster(i, n), N.push(i), i
    }

    function U() {
        o.gem > 0 && (w == null && (w = new l, w.p(s.BuildingType.Tower.position), t.trigger("newEntity", [w])), w.animation(o.gem - 1))
    }

    function z() {
        for (var e in N) {
            var t = N[e];
            !t.uninterruptable && t.action != null && t.action.reinitialize(t)
        }
    }

    function W(e) {
        var t = E[e.className];
        t != null && clearTimeout(t), e.start && e.start(y), E[e.className] = setTimeout(function () {
            e.end && e.end(y), E[e.className] = null, z()
        }, e.duration), z()
    }

    function X(e) {
        var t = E[e.className];
        E[e.className] = null, t != null && (clearTimeout(t), e.end && e.end(y))
    }

    function V(e) {
        N.push(e)
    }

    function $(e) {
        for (var t in N)
            if (N[t] == e) {
                N.splice(t, 1);
                return
            }
    }

    function J() {
        S || (tt(), ot())
    }

    function K() {
        S ? y.takeDamage(Math.floor(y.hp() / 2)) : tt(5)
    }

    function Q(e, n) {
        for (typeName in e) {
            var r = s.getResourceType(typeName);
            if (S && !C) {
                var i = null;
                if (x && r.dragonEffect) i = "dragon:" + r.dragonEffect;
                else
                    for (var u in r.nightEffect)
                        if (u == "default" || o.hasBuilding(s.getBuildingType(u))) {
                            i = r.nightEffect[u];
                            break
                        } if (i != null) {
                    var a = i.split(":");
                    switch (a[0]) {
                        case "dragon":
                            ct(a[1]);
                            break;
                        case "spawn":
                            R(a[1], e[typeName], n);
                            break;
                        case "shield":
                            F();
                            break;
                        case "sword":
                            I()
                    }
                }
            } else {
                var f = e[typeName];
                O != null && (O += f);
                if (r.multipliers)
                    for (var u in r.multipliers) {
                        var l = s.getBuildingType(u);
                        o.hasBuilding(l, !0) && (f *= r.multipliers[u])
                    }
                f *= _, r == s.ResourceType.Grain ? t.trigger("healDude", [f]) : r == s.ResourceType.Mana ? q(f) : c.collectResource(s.getResourceType(typeName), f)
            }
        }
    }

    function G() {
        if (require("app/engine").paused) return;
        if (g && D.hasEffect("haste") && !y.paused) Y(y);
        else if (!g) {
            var e = 0;
            for (var n = 0; n < N.length; n++) {
                var i = N[n],
                    s = E["freezeTime"] != null && i != y;
                (i.hostile || i.lootable) && !S && (i.action != null && i.action.terminateAction(i), i.el().remove(), i.gone = !0), i.gone ? i.hostile ? (S && !i.wiped && (y.gainXp(i.getXp() * _), tt()), t.trigger("monsterKilled", [i]), o.count("KILLED", 1), N.splice(n, 1), n--) : i.lootable ? (N.splice(n, 1), n--) : i == y && (N.splice(n, 1), n--, C = !0, o.count("DEATHS", 1), o.savePersistents(), r.fadeOut(function () {
                    setTimeout(function () {
                        N.length = 0, r.setNight(!1)
                    }, 500), setTimeout(function () {
                        require("app/engine").init()
                    }, 1900)
                })) : (!i.paused && !s && Y(i), i.hostile && e++)
            }
            o.setIfHigher("ATONCE", e)
        }
        g = !g
    }

    function Y(e) {
        e.think() || e.animate(), e.action != null && e.action.doFrameAction(e.frame)
    }

    function Z() {
        y = new p, N.push(y), y.makeIdle(), y.action = u.getAction("Climb"), y.action.doAction(y), r.addToWorld(y), y.p(r.worldWidth() / 2), r.setPosition(y, y.p())
    }

    function et() {
        b = new h, N.push(b), b.animation(0), r.addToWorld(b), r.raiseCelestial(b), t.trigger("dayBreak", [o.dayNumber])
    }

    function tt(e) {
        if (E["freezeTime"] != null) return;
        e = e == null ? 1 : e;
        if (b != null) {
            var n = S ? D.options.nightMoves : D.options.dayMoves;
            T += e;
            if (T >= n) t.trigger("phaseChange", [!S]);
            else {
                var i = r.worldWidth();
                b.p(Math.floor(i / n) * T), r.moveCelestial(b)
            }
        }
    }

    function nt() {
        C = !0, r.phaseTransition(b, function () {
            C = !1
        }), S = !S, y.action != null && y.action.terminateAction(y), T = 0, y.shield = 0, y.sword = 0, r.updateShield(0, 0), r.updateSword(0, 0), S ? casualNight = require("app/gameoptions").get("casualMode", !1) : (console.log("casual night? " + casualNight), N.forEach(function (e) {
            e.lootable && t.trigger("pickupLoot", [e, D.getDebugMultiplier()])
        }), x = null, M++, o.dayNumber++, o.count("NIGHTS", 1), o.setIfHigher("ROW", M), o.save(), r.notifySave(), t.trigger("dayBreak", [o.dayNumber]), casualNight && o.count("CASUALNIGHTS", 1))
    }

    function rt(e) {
        S && e && (casualNight = !0)
    }

    function it(e) {
        for (var t in N) {
            var n = N[t];
            n.hostile && n.isAlive() && (n.takeDamage(e), !n.isAlive() && !n.isBoss && (n.wiped = !0))
        }
    }

    function st() {
        for (var e in N) {
            var n = N[e];
            n.hostile && n.isAlive() && !n.isBoss && (n.wiped = !0, n.die(), t.trigger("monsterKilled", [n]))
        }
    }

    function ot() {
        y != null && y.takeDamage(1)
    }

    function ut(e) {
        y != null && y.heal(e)
    }

    function at(e) {
        y != null && y.takeDamage(e)
    }

    function ft(e, t) {
        c.loaded || (c.init(), et(), o.save(), r.notifySave()), c.setSize(e, t)
    }

    function lt() {
        return x = a.getMonster("dragon", {
            flip: y.p() >= r.worldWidth() / 2,
            target: y,
            multiplier: (o.prestige + 1) * m
        }), N.push(x), x.action = u.getAction("Land"), x.action.doAction(x), x
    }

    function ct(e) {
        x.queueAttack(e)
    }
    var m = .5,
        g = !1,
        y = null,
        b = null,
        w = null,
        E = {},
        S = !1,
        x = null,
        T = 0,
        N = [],
        C = !1,
        k = null,
        L = null,
        A = null,
        O = null,
        M = 0,
        _ = 1;
    multiplier = function (e) {
        _ = e > 0 ? e : 1, D.getDude() && z()
    };
    var D = {
        options: {
            dayMoves: 20,
            nightMoves: 15
        },
        init: function (n) {
            e.extend(this.options, n), _el = null, y = null, b = null, L = null, w = null, N.length = 0, E = {}, S = !1, T = 0, x = null;
            var i = [];
            M = 0;
            var u = !1;
            t.bind("difficultyChanged", rt), t.bind("launchDude", Z), t.bind("wipeMonsters", st), t.bind("landDragon", st), t.bind("damageAll", it), t.bind("healDude", ut), t.bind("hurtDude", at), t.bind("newEntity", V), t.bind("removeEntity", $), t.bind("buildingComplete", V), t.bind("buildingComplete", H), t.bind("tilesCleared", Q), t.bind("noMoreMoves", K), t.bind("tilesSwapped", J), t.bind("updateGem", U), t.bind("phaseChange", nt), t.bind("newStateEffect", W), t.bind("endStateEffect", X), t.bind("levelUp", st), t.bind("resourceStoreChanged", ft), t.bind("prioritizeBuilding", P), t.bind("callDragon", lt), t.bind("keySequenceComplete", multiplier.bind(this, 5)), t.bind("fillEquipment", function () {
                F(), I()
            }), t.bind("gameLoaded", function () {
                U();
                for (var t in o.buildings) {
                    var n = o.buildings[t];
                    if (n.built && !n.obsolete) {
                        r.addToWorld(n), r.setPosition(n, n.p()), n.options.type.tileMod && e(".gameBoard").addClass(n.options.type.tileMod + n.options.type.tileLevel), n.el().css("bottom", "0px"), n.el().find(".blockPile").css("top", "100%");
                        var u = s.BuildingCallbacks[n.options.type.className];
                        u && i.push(u)
                    } else !n.obsolete && j(n.options.type) && (r.addToWorld(n), r.setPosition(n, n.p()), r.updateCosts(n));
                    n.options.type.className == o.prioritizedBuilding && P(n)
                }
                while (i.length > 0) i.pop()();
                k != null && clearInterval(k), k = setInterval(G, 100), C = !1
            })
        },
        getActivity: function () {
            if (o.health <= 0) return u.getAction("Die");
            if (!S) {
                var t = null;
                if (A)
                    for (var n in o.stores) {
                        var a = o.stores[n],
                            f = a.options.type.className;
                        !a.gone && a.spaceLeft() == 0 && A.requiredResources[f] > 0 && (t = u.getAction("MoveBlock", {
                            block: a,
                            destination: A
                        }))
                    }
                var l = null,
                    c = null,
                    h = null;
                for (var p in s.BuildingType) {
                    var d = s.BuildingType[p],
                        v = o.getBuilding(d);
                    v == null && j(d) && (v = new i({
                        type: d
                    }), o.buildings.push(v), r.addToWorld(v), r.setPosition(v, v.p()));
                    if (v != null && v.readyToBuild()) return u.getAction("RaiseBuilding", {
                        building: v
                    });
                    if (t) c = t;
                    else if (v != null && !v.built)
                        for (var n in o.stores) {
                            var a = o.stores[n];
                            if (!a.gone && a.spaceLeft() == 0) {
                                var f = a.options.type.className,
                                    m = v.requiredResources[f],
                                    g = h == null || d.priority < h || d.priority == h && (l == null || m > l);
                                m > 0 && g && (c = u.getAction("MoveBlock", {
                                    block: a,
                                    destination: v
                                }), h = d.priority, l = m)
                            }
                        }
                }
                return c
            }
            var e = D.findClosestMonster();
            return e != null && y.attackRange(e) ? u.getAction("Attack", {
                target: e
            }) : e != null ? u.getAction("MoveTo", {
                target: e
            }) : (e = D.findClosestLoot(), e != null && y.p() == e.p() ? u.getAction("GetLoot", {
                target: e
            }) : e != null ? u.getAction("MoveTo", {
                target: e,
                useMove: !0
            }) : null)
        },
        removeBuilding: function (e) {
            e.obsolete = !0, N.splice(N.indexOf(e), 1), e.el().remove()
        },
        hasEffect: function (e) {
            return E[e] != null
        },
        getDude: function () {
            return y
        },
        findClosestMonster: function () {
            return B(function (e) {
                return e.hostile && e.isAlive()
            })
        },
        findClosestLoot: function () {
            return B(function (e) {
                return e.lootable && !e.gone
            })
        },
        canMove: function () {
            return !C && y.isAlive()
        },
        isNight: function () {
            return S
        },
        startRecording: function () {
            console.log("Beginning resource recorder"), O = 0
        },
        reportRecord: function () {
            console.log(O + " resources have been gained.")
        },
        removeAllEffects: function (e) {
            var t = N.length;
            while (t--) {
                var n = N[t];
                n instanceof v && n.options.effectClass == e && (N.splice(t, 1), n.el().remove())
            }
        },
        gameOver: function () {
            o.count("DRAGONS", 1), o.save(), r.notifySave(), t.trigger("gameOver", [o.counts])
        },
        getDebugMultiplier: function () {
            return _
        },
        setPause: function (e) {
            e && k ? (clearInterval(k), k = !1) : k = setInterval(G, 300)
        }
    };
    return D
}), define("app/entity/loot/treasurechest", ["app/entity/worldentity"], function (e) {
    var t = function (e) {
        this.options = $.extend({}, this.options, {}, e), this.lootable = !0
    };
    return t.prototype = new e({
        className: "treasureChest nightSprite",
        spriteName: "treasurechest",
        animationFrames: 0
    }), t.constructor = t, t
}), define("app/loot", ["app/eventmanager", "app/entity/loot/treasurechest", "app/gamestate", "app/gamecontent"], function (e, t, n, r) {
    function a(n) {
        var r = (n.dropChance || s) * 3 + (n.dropChance || o) * (n.options.tiles - 3),
            i = Math.random();
        if (n.forceLoot || i < r) {
            var u = new t({
                forceLoot: n.getLoot()
            });
            u.p(n.p()), e.trigger("newEntity", [u])
        }
    }

    function f(t, s) {
        var o = null,
            a = .05;
        n.dayNumber > 20 / s && (a *= 2), n.dayNumber > 40 / s && (a *= 2);
        if (t.options.forceLoot) o = t.options.forceLoot;
        else if (n.gem < 4 && Math.random() < a * s) o = "shard";
        else {
            var f = Math.random(),
                l = null;
            for (var c in u)
                if (f < u[c]) {
                    l = r.lootPools[c];
                    break
                }
            var h = 0;
            for (h in l);
            h++, f = Math.random();
            for (i in l) {
                o = l[i];
                if (f < (i + 1) / h) break
            }
        }
        e.trigger("lootGained", [o, t]);
        if (o == "shard") {
            var p = n.gem || 0;
            n.gem = ++p > 4 ? 4 : p, e.trigger("updateGem")
        } else {
            n.count("LOOT", 1);
            var p = n.items[o] || 0;
            p++;
            var d = r.LootType[o].large ? 1 : 3;
            p = p < d ? p : d, n.items[o] = p, e.trigger("lootFound", [o, p])
        }
        t.gone = !0
    }
    var s = .05,
        o = .15,
        u = {
            rare: .1,
            uncommon: .35,
            common: 1
        };
    return {
        init: function () {
            e.bind("monsterKilled", a, this), e.bind("pickupLoot", f, this)
        },
        useItem: function (t) {
            var i = n.items[t];
            i > 0 && require("app/world").canMove() && (i--, n.items[t] = i, e.trigger("lootUsed", [t, i]), r.LootType[t].onUse())
        }
    }
}), define("app/magic", ["app/eventmanager", "app/gamestate", "app/gamecontent"], function (e, t, n) {
    function i(i) {
        t.mana >= r && (t.mana -= r, e.trigger("updateMana", [t.mana, t.maxMana()]), n.Spells[i].onUse(), t.count("CAST", 1))
    }
    var r = 3;
    return {
        init: function () {
            e.bind("castSpell", i)
        }
    }
}), define("app/audio/webaudioprovider", [], function () {
    function r(r, i) {
        var s = e.createBufferSource();
        return r.partsBuffer ? (r.playingPart = i, s.buffer = r.partsBuffer[r.playingPart], i < r.parts - 1 ? s.onended = function () {
            u.play(r, i + 1)
        } : r.music && (s.onended = function () {
            u.play(r, 0)
        })) : s.buffer = r.buffer, r.music ? (r.partsBuffer || (s.loop = !0), r.volume = e.createGain(), r.volume.gain.value = 1, r.volume.connect(t), s.connect(r.volume)) : s.connect(n), s
    }

    function i(e) {
        return e.parts && e.partsBuffer && e.partsBuffer[e.playingPart || 0] || e.buffer
    }

    function s(e, t, n) {
        e.playingPart != null && n != null && e.playingPart == n ? u.play(e, n) : e.deferred ? (e.deferred = !1, e.playRequested && u.play(e)) : t(e.file)
    }

    function o(t, n, r, i, o) {
        n = n || "";
        var u = new XMLHttpRequest,
            a = o != null;
        a && (t.partsBuffer = t.partsBuffer || []), u.open("GET", n + "audio/" + t.file + (a ? "-" + o : "") + "." + r, !0), u.responseType = "arraybuffer", u.onload = function () {
            t.music && !t.required && (t.deferred = !0, i(t.file)), e.decodeAudioData(u.response, function (e) {
                a ? (t.partsBuffer[o] = e, s(t, i, o)) : (t.buffer = e, s(t, i))
            })
        }, u.send()
    }
    var e = null,
        t = null,
        n = null,
        u = {
            getInstance: function () {
                if (typeof AudioContext != "undefined") e = new AudioContext;
                else {
                    if (typeof webkitAudioContext == "undefined") return null;
                    e = new webkitAudioContext
                }
                return t = e.createGain(), t.connect(e.destination), n = e.createGain(), n.connect(e.destination), u
            },
            load: function (e, t, n, r) {
                if (e.parts != null)
                    for (var i = 0; i < e.parts; i++)(function (s) {
                        setTimeout(function () {
                            o(e, t, n, r, s)
                        }, i * 3e3)
                    })(i);
                else o(e, t, n, r)
            },
            play: function (e, t) {
                e.playingPart = t || 0;
                if (i(e)) {
                    var n = e.currentSource = r(e, e.playingPart);
                    e.silentIf && e.silentIf() && e.volume != null && (e.volume.gain.value = 0), n.start(0)
                } else e.playRequested = !0
            },
            stop: function (e) {
                e.currentSource && e.currentSource.stop(0)
            },
            setMusicVolume: function (e) {
                t && (t.gain.value = e)
            },
            setEffectsVolume: function (e) {
                n && (n.gain.value = e)
            },
            crossFade: function (e, t, n) {
                i(e) && i(t) && function r() {
                    e.volume.gain.value -= .1, e.volume.gain.value = e.volume.gain.value < 0 ? 0 : e.volume.gain.value, t.volume.gain.value += .1, t.volume.gain.value = t.volume.gain.value > 1 ? 1 : t.volume.gain.value, e.volume.gain.value > 0 && setTimeout(r, n / 10)
                }()
            }
        };
    return u
}), define("app/audio/htmlaudioprovider", [], function () {
    var e = [],
        t = [],
        n = 1,
        r = 3e4,
        i = {
            getInstance: function () {
                return i
            },
            load: function (n, i, s, o) {
                i = i || "", n.data = new Audio(i + "audio/" + n.file + "." + s), n.music ? (n.data.loop = !0, e.push(n)) : t.push(n);
                var u = setTimeout(function () {
                    n.data = null, o(n.file, !0)
                }, r);
                n.data.addEventListener("canplaythrough", function () {
                    clearTimeout(u), o(n.file)
                })
            },
            play: function (e) {
                if (e.data) {
                    e.silentIf && e.silentIf() && (e.data.fadedOut = !0, e.data.volume = 0);
                    if (e.music) e.data.play();
                    else {
                        var t = e.data.cloneNode();
                        t.volume = e.data.volume, t.fadedOut = e.data.fadedOut, t.play()
                    }
                }
            },
            stop: function (e) {
                e.data && e.data.pause()
            },
            setMusicVolume: function (t) {
                n = t, e.forEach(function (e) {
                    e.data.fadedOut ? e.data.volume = 0 : e.data.volume = t
                })
            },
            setEffectsVolume: function (e) {
                t.forEach(function (t) {
                    t.data.volume = e
                })
            },
            crossFade: function (e, t, r) {
                e.data.fadedOut = !0, t.data.fadedOut = !1;
                var i = n / 10;
                (function s() {
                    var n = e.data.volume - i;
                    n = n < 0 ? 0 : n, e.data.volume = n;
                    var o = t.data.volume + i;
                    o = o > 1 ? 1 : o, t.data.volume = o, n > 0 && setTimeout(s, r / 10)
                })()
            }
        };
    return i
}), define("app/audio/htmlwebaudioprovider", [], function () {
    function i(r) {
        var i, s;
        return r.music ? (s = r.data, i = e.createMediaElementSource(s), i.loop = !0, r.volume = e.createGain(), r.volume.gain.value = 1, r.volume.connect(t), i.connect(r.volume)) : (s = r.data.cloneNode(), i = e.createMediaElementSource(s), i.connect(n)), s
    }
    var e = null,
        t = null,
        n = null,
        r = 3e4,
        s = {
            getInstance: function () {
                if (typeof AudioContext != "undefined") e = new AudioContext;
                else {
                    if (typeof webkitAudioContext == "undefined") return null;
                    e = new webkitAudioContext
                }
                return t = e.createGain(), t.connect(e.destination), n = e.createGain(), n.connect(e.destination), s
            },
            load: function (e, t, n, i) {
                t = t || "", e.data = new Audio(t + "audio/" + e.file + "." + n), e.music && (e.data.loop = !0), e.music && !e.required && (e.deferred = !0, i(e.file));
                var o = setTimeout(function () {
                    e.data = null, i(e.file, !0)
                }, r);
                e.data.addEventListener("canplaythrough", function () {
                    clearTimeout(o), e.deferred ? (e.deferred = !1, e.playRequested && s.play(e)) : i(e.file)
                })
            },
            play: function (e) {
                if (e.data) {
                    var t = e.currentSource = i(e);
                    e.silentIf && e.silentIf() && e.volume != null && (e.volume.gain.value = 0), t.play()
                } else e.deferred && (e.playRequested = !0)
            },
            stop: function (e) {
                e.buffer && e.currentSource.pause()
            },
            setMusicVolume: function (e) {
                t && (t.gain.value = e)
            },
            setEffectsVolume: function (e) {
                n && (n.gain.value = e)
            },
            crossFade: function (e, t, n) {
                e.data && t.data && function r() {
                    e.volume.gain.value -= .1, e.volume.gain.value = e.volume.gain.value < 0 ? 0 : e.volume.gain.value, t.volume.gain.value += .1, t.volume.gain.value = t.volume.gain.value > 1 ? 1 : t.volume.gain.value, e.volume.gain.value > 0 && setTimeout(r, n / 10)
                }()
            }
        };
    return s
}), define("app/audio/audio", ["app/eventmanager", "app/audio/webaudioprovider", "app/audio/htmlaudioprovider", "app/audio/htmlwebaudioprovider"], function (e, t, n, r) {
    function d(e) {
        u != null && (o++, a.load(e, h, u, v))
    }

    function v(e, t) {
        t && console.log("Loading sound " + e + " failed."), o--
    }

    function m() {
        var e = new Audio;
        return !e.canPlayType || !e.canPlayType("audio/ogg;").replace(/no/, "") ? !e.canPlayType || !e.canPlayType("audio/mpeg;").replace(/no/, "") ? null : "mp3" : "ogg"
    }

    function g() {
        var e = t.getInstance();
        return e == null && (e = n.getInstance()), e
    }

    function y(e, t, n) {
        a.crossFade(p[e], p[t], n)
    }

    function b() {
        f || (f = !0, N.play("DayMusic"), N.play("NightMusic"))
    }

    function w() {
        N.play("BossMusic"), y("NightMusic", "BossMusic", 500), c = !0
    }

    function E(e) {
        c ? (y("BossMusic", e ? "NightMusic" : "DayMusic", 500), N.stop("BossMusic"), c = !1) : e ? y("DayMusic", "NightMusic", 700) : y("NightMusic", "DayMusic", 700)
    }

    function S(e) {
        switch (e) {
            case "healthPotion":
                return "Heal";
            case "bomb":
                return "Bomb";
            case "equipment":
                return "Equip"
        }
    }

    function x(e) {
        N.play(S(e))
    }

    function T(e) {
        N.setMusicVolume(e ? 0 : require("app/gameoptions").get("musicVolume"), !0), N.setEffectsVolume(e ? 0 : require("app/gameoptions").get("effectsVolume"), !0)
    }
    var i = 3e4,
        o = 0,
        u = null,
        a = null,
        f = !1,
        l = !1,
        c = !1,
        h = "./",
        p = {
            DayMusic: {
                file: "theme-day",
                parts: 4,
                music: !0,
                silentIf: function () {
                    return require("app/engine").isNight()
                },
                required: !0
            },
            NightMusic: {
                file: "theme-night",
                music: !0,
                silentIf: function () {
                    return !require("app/engine").isNight()
                }
            },
            BossMusic: {
                file: "theme-boss",
                music: !0,
                noPlay: !0
            },
            Click: {
                file: "click"
            },
            TileClick: {
                file: "tileclick"
            },
            Match: {
                file: "match-test"
            },
            Blunt: {
                file: "blunt"
            },
            Slash: {
                file: "slash"
            },
            BlockUp: {
                file: "blockup"
            },
            BlockDown: {
                file: "blockdown"
            },
            Die: {
                file: "die"
            },
            Shoot: {
                file: "shoot"
            },
            Open: {
                file: "open"
            },
            Heal: {
                file: "heal"
            },
            Bomb: {
                file: "bomb"
            },
            Equip: {
                file: "equip"
            },
            Teleport: {
                file: "teleport"
            },
            TileExplode: {
                file: "tilexplode"
            },
            Wing: {
                file: "wing"
            },
            Haste: {
                file: "haste"
            },
            RefreshBoard: {
                file: "reset"
            },
            PhaseChange: {
                file: "phasechange"
            },
            FreezeTime: {
                file: "freeze"
            },
            LevelUp: {
                file: "levelup"
            },
            DragonLand: {
                file: "land"
            },
            DragonRoar: {
                file: "roar"
            },
            ShootFire: {
                file: "dshoot"
            },
            ExplodeFire: {
                file: "fireexplode"
            },
            Charge: {
                file: "charge"
            },
            Ice: {
                file: "ice"
            },
            Fire: {
                file: "fire"
            },
            SegmentExplode: {
                file: "dexplode"
            },
            DragonExplode: {
                file: "dannihilate"
            },
            LichSpell: {
                file: "lichspell"
            }
        },
        N = {
            init: function (t) {
                t = t || {};
                if (!a) try {
                    a = g(), u = m();
                    if (a != null && u != null) {
                        o = 0;
                        for (s in p)(!t.nomusic || !p[s].music) && d(p[s]);
                        e.bind("dayBreak", b)
                    }
                } catch (n) {
                    console.error("Failed to init audio. Your browser sucks.");
                    return
                } else y(c ? "BossMusic" : "NightMusic", "DayMusic", 700);
                c = !1, e.bind("pause", function () {
                    T(!0)
                }), e.bind("unpause", function () {
                    T(!1)
                }), e.bind("tileDrop", N.play.bind(this, "TileClick")), e.bind("setMusicVolume", N.setMusicVolume), e.bind("setEffectsVolume", N.setEffectsVolume), e.bind("phaseChange", E), e.bind("tilesCleared", N.play.bind(this, "Match")), e.bind("bluntHit", N.play.bind(this, "Blunt")), e.bind("sharpHit", N.play.bind(this, "Slash")), e.bind("blockDown", N.play.bind(this, "BlockDown")), e.bind("blockUp", N.play.bind(this, "BlockUp")), e.bind("death", N.play.bind(this, "Die")), e.bind("shoot", N.play.bind(this, "Shoot")), e.bind("pickupLoot", N.play.bind(this, "Open")), e.bind("prioritize", N.play.bind(this, "BlockUp")), e.bind("deprioritize", N.play.bind(this, "BlockDown")), e.bind("teleport", N.play.bind(this, "Teleport")), e.bind("lootUsed", x), e.bind("tileExplode", N.play.bind(this, "TileExplode")), e.bind("flap", N.play.bind(this, "Wing")), e.bind("haste", N.play.bind(this, "Haste")), e.bind("refreshBoardSpell", N.play.bind(this, "RefreshBoard")), e.bind("phaseChangeSpell", N.play.bind(this, "PhaseChange")), e.bind("freezeTime", N.play.bind(this, "FreezeTime")), e.bind("levelUp", N.play.bind(this, "LevelUp")), e.bind("landDragon", N.play.bind(this, "DragonLand")), e.bind("roar", N.play.bind(this, "DragonRoar")), e.bind("shootFire", N.play.bind(this, "ShootFire")), e.bind("explodeFire", N.play.bind(this, "ExplodeFire")), e.bind("charge", N.play.bind(this, "Charge")), e.bind("ice", N.play.bind(this, "Ice")), e.bind("burn", N.play.bind(this, "Fire")), e.bind("segmentExplode", N.play.bind(this, "SegmentExplode")), e.bind("dragonExplode", N.play.bind(this, "DragonExplode")), e.bind("callDragon", w.bind(this)), e.bind("lichSpell", N.play.bind(this, "LichSpell")), N.setMusicVolume(require("app/gameoptions").get("musicVolume")), N.setEffectsVolume(require("app/gameoptions").get("effectsVolume")), l = setTimeout(function () {
                    e.trigger("longLoad")
                }, i)
            },
            isReady: function () {
                return o <= 0 ? (clearTimeout(l), !0) : !1
            },
            setMusicVolume: function (e, t) {
                !t && require("app/gameoptions").set("musicVolume", e), a.setMusicVolume(e)
            },
            setEffectsVolume: function (e, t) {
                !t && require("app/gameoptions").set("effectsVolume", e), a.setEffectsVolume(e)
            },
            play: function (e, t) {
                var n = p[e];
                n && a && a.play(n, t)
            },
            stop: function (e) {
                var t = p[e];
                t && a && a.stop(p[e])
            }
        };
    return N
}), define("app/graphics/share", ["app/graphics/graphics", "app/eventmanager", "app/graphics/graphics"], function () {
    function r() {
        var e = require("app/graphics/graphics");
        return n == null && (e.addStyleRule(".social:before", 'content:"- ' + e.getText("SHARE") + ' -";'), n = e.make("social submenu", "ul"), t.forEach(function (t) {
            var r = e.make("litBorder", "li").appendTo(n);
            e.make(t.className).appendTo(r), e.make(t.className + " nightSprite", "a").attr({
                href: t.url,
                target: "_blank",
                title: t.name
            }).click(function () {
                require("app/eventmanager").trigger("click", [t.className])
            }).appendTo(r)
        })), n
    }
    var e = encodeURIComponent("https://gridland.doublespeakgames.com"),
        t = [{
            className: "twitter",
            url: "https://twitter.com/intent/tweet?text=Match.%20Build.%20Survive.&url=" + e,
            name: "Twitter"
        }, {
            className: "facebook",
            url: "https://www.facebook.com/sharer/sharer.php?u=" + e,
            name: "Facebook"
        }, {
            className: "reddit",
            url: "https://www.reddit.com/submit?url=" + e,
            name: "Reddit"
        }, {
            className: "gplus",
            url: "httpss://plus.google.com/share?url=" + e,
            name: "Google+"
        }, {
            className: "tumblr",
            url: "https://www.tumblr.com/share/link?url=" + e,
            name: "Tumblr"
        }, {
            className: "stumbleupon",
            url: "https://www.stumbleupon.com/submit?url=" + e,
            name: "StumbleUpon"
        }],
        n = null;
    return {
        init: function () {
            var e = require("app/graphics/graphics");
            e.addToMenu(r())
        }
    }
}), define("app/graphics/donate", ["app/graphics/graphics", "app/graphics/graphics"], function () {
    function n() {
        var n = require("app/graphics/graphics");
        return t == null && (n.addStyleRule(".donate:before", 'content:"- ' + n.getText("DONATE") + ' -";'), t = n.make("donate submenu", "ul"), e.forEach(function (e) {
            n.make("litBorder", "li").html(e).appendTo(t)
        })), t
    }
    var e = ['<form method="post" target="_blank" action="https://www.paypal.com/cgi-bin/webscr"><input type="hidden" value="_donations" name="cmd"><input type="hidden" value="continuities@gmail.com" name="business"><input type="hidden" value="Donation to doublespeak games" name="item_name"><input type="hidden" value="0" name="rm"><input type="hidden" value="CAD" name="currency_code"><input onclick="require(\'app/eventmanager\').trigger(\'click\', [\'paypal\']);" type="image" alt=" " title="PayPal" name="submit" class="paypal nightSprite"><input type="image" alt=" " class="paypal"></input></form>', '<a  onclick="require(\'app/eventmanager\').trigger(\'click\', [\'flattr\']);" class="flattr nightSprite" title="Flattr" target="_blank" href="https://flattr.com/thing/1570114/doublespeak-games"></a><input type="image" alt=" " class="flattr"></input>', '<div class="bitcoin"><a onclick="require(\'app/eventmanager\').trigger(\'click\', [\'bitcoin\']);" href="bitcoin:151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN" data-info="none" data-address="151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN" class="bitcoin-button nightSprite" target="_blank"></a><input type="image" alt=" " class="bitcoin-button"></input><div class="bitcoin-bubble"><img width="200" height="200" alt="QR code" src="">151Ch7PwzMtiVEHMYth5F9REmySvxKJBDN</div></div>', '<a onclick="require(\'app/eventmanager\').trigger(\'click\', [\'gittip\']);" class="gittip nightSprite" title="Gittip" target="_blank" href="https://www.gittip.com/Continuities/"></a><input type="image" alt=" " class="gittip"></input>'],
        t = null;
    return {
        init: function () {
            require("app/graphics/graphics").addToMenu(n())
        }
    }
}), define("app/visibility", ["app/eventmanager"], function (e) {
    function r(n) {
        (n === !1 || n == null && document[t] && require("app/engine").isStarted()) && e.trigger("pause")
    }
    var t = null,
        n = null;
    typeof document.hidden != "undefined" ? (t = "hidden", n = "visibilitychange") : typeof document.mozHidden != "undefined" ? (t = "mozHidden", n = "mozvisibilitychange") : typeof document.msHidden != "undefined" ? (t = "msHidden", r = "msvisibilitychange") : typeof document.webkitHidden != "undefined" && (t = "webkitHidden", n = "webkitvisibilitychange"), t != null && window.addEventListener ? document.addEventListener(n, function () {
        r(null)
    }) : (window.onfocus = function () {
        r(!0)
    }, window.onblur = function () {
        r(!1)
    });
    var i = {
        init: function () {},
        isReady: function () {
            return !0
        }
    };
    return i
}), define("app/keysequencer", ["app/eventmanager"], function (e) {
    function s(s) {
        s = s || window.event, i && (clearTimeout(i), i = null), s.keyCode == n[r] ? (r++, r >= n.length ? (r = 0, e.trigger("keySequenceComplete")) : i = setTimeout(function () {
            r = 0, i = null
        }, t)) : r = 0
    }
    var t = 1e3,
        n = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13],
        r, i, o = {
            init: function () {
                window.onkeydown = s, r = 0
            }
        };
    return o
}), define("app/graphics/difficulty", ["app/eventmanager", "app/gameoptions"], function (e, t) {
    function i() {
        return r == null && (n.addStyleRule(".difficulty:before", 'content:"- ' + n.getText("DIFFICULTY") + ' -";'), r = n.make("difficulty submenu").append(n.make("difficultySwitch litBorder")), n.addToMenu(r)), r
    }

    function s() {
        t.set("casualMode", !t.get("casualMode", !1)), o(), e.trigger("difficultyChanged", [t.get("casualMode", !1)])
    }

    function o() {
        i().toggleClass("casual", t.get("casualMode", !1))
    }
    var n = null,
        r = null;
    return {
        init: function () {
            n = require("app/graphics/graphics"), r && r.remove(), r = null, i().off().on("click touchstart", s), o()
        }
    }
}), define("app/engine", ["jquery", "app/eventmanager", "app/analytics", "app/graphics/graphics", "app/gamecontent", "app/gameboard", "app/gamestate", "app/world", "app/loot", "app/magic", "app/gameoptions", "app/audio/audio", "app/graphics/share", "app/graphics/donate", "app/visibility", "app/keysequencer", "app/graphics/difficulty"], function (e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m) {
    function C(e, t) {
        var n = null;
        (function r() {
            if (n == null) {
                if (e.length == 0) return t();
                n = e.shift();
                var i = null;
                typeof n.init != "function" && n.length && n.length == 2 && (i = n[1], n = n[0]), n.init(i)
            }
            L(n) ? (n = null, r()) : setTimeout(r, 50)
        })()
    }

    function k() {
        return /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
    }

    function L(e) {
        return typeof e.isReady == "function" ? e.isReady() : e.isReady != null ? e.isReady : !0
    }

    function A() {
        return S == null && s.canMove() && u.canMove() && !j.paused
    }

    function O(e) {
        if (A())
            if (b == null) b = e, r.selectTile(e);
            else {
                var t = b;
                b = null, r.deselectTile(t), e.isAdjacent(t) && s.switchTiles({
                    row: t.options.row,
                    col: t.options.column
                }, {
                    row: e.options.row,
                    col: e.options.column
                })
            }
    }

    function M(e) {
        if (b != null) {
            var t = e.x / g;
            t = t < 0 ? Math.ceil(t) : Math.floor(t), t = t / Math.abs(t) || 0;
            var n = e.y / g;
            n = n < 0 ? Math.ceil(n) : Math.floor(n), n = n / Math.abs(n) || 0;
            if (Math.abs(t) + Math.abs(n) == 1) {
                var i = b;
                return b = null, r.deselectTile(i), i.options.row + n >= 0 && i.options.row + n < s.options.rows && i.options.column + t >= 0 && i.options.column + t < s.options.columns && s.switchTiles({
                    row: i.options.row,
                    col: i.options.column
                }, {
                    row: i.options.row + n,
                    col: i.options.column + t
                }), !0
            }
            return !1
        }
    }

    function _() {
        if (typeof S == "function") {
            var e = S;
            S = null, e()
        }
    }

    function D(n) {
        o.load(n), t.bind("graphicsActionComplete", _), t.trigger("gameLoaded"), t.trigger("refreshBoard"), t.trigger("launchDude"), e("body").removeClass("titleScreen"), N = !0
    }

    function P(e, t) {
        o.import(e, t), r.replaceSlot(e, o.getSlotInfo(e))
    }

    function H() {
        return location.search.indexOf("ignorebrowser") >= 0 || typeof Storage != "undefined"
    }

    function B(e) {
        j.paused = e, e && r.get("body").one("click touchstart", function () {
            t.trigger("unpause")
        })
    }
    var g = 30,
        y = 1.6,
        b = null,
        w = !1,
        E = {
            x: 0,
            y: 0
        },
        S = null,
        x = !1,
        T = !0,
        N = !1,
        j = {
            options: {},
            init: function (i) {
                e.extend(this.options, i), H() || (window.location = "browserWarning.html"), e("#test").off().click(function () {
                    t.trigger("phaseChange", [!j.isNight()])
                }), e(".menuBtn").off().on("click touchstart", function () {
                    var n = e(".menuBar");
                    n.toggleClass("open").addClass("closing"), setTimeout(function () {
                        n.removeClass("closing")
                    }, 200), t.trigger("click", ["menubutton"])
                }), e("#pauseIcon").off().on("click touchstart", function () {
                    if (!j.paused) return t.trigger("pause"), !1
                });
                var g = null;
                window.screen.height / window.screen.width >= y && (g = {
                    rows: 8,
                    columns: 7,
                    mobile: !0
                });
                var b = [t, d, n, [s, g], [r, {
                    ios: k()
                }], u, a, f, v];
                window.location.search.indexOf("nomusic") >= 0 ? (b.push([c, {
                    nomusic: !0
                }]), T = !1) : window.location.search.indexOf("silent") < 0 && (b.push(c), T = !1), b.push(m), b.push(h), b.push(p), l.load(), C(b, function () {
                    x ? D() : (x = !0, r.enablePlayButton())
                }), t.bind("prestige", function () {
                    o.count("PRESTIGE", 1), o.doPrestige(), j.init()
                }), t.bind("slotChosen", D), t.bind("deleteSlot", o.deleteSlot), t.bind("importSlot", P), t.bind("pause", B.bind(this, !0)), t.bind("unpause", function () {
                    B(!1), t.trigger("afterUnpaused")
                }), r.attachHandler("GameBoard", "mousedown touchstart", ".tile", function (n) {
                    if (!w) {
                        n.originalEvent.changedTouches && (n = n.originalEvent.changedTouches[0]), E.x = n.clientX, E.y = n.clientY, w = !0;
                        var r = e.data(this, "tile");
                        O(r)
                    }
                    return t.trigger("toggleMenu"), !1
                }), r.attachHandler("GameBoard", "mouseup touchend", function (e) {
                    return w = !1, !1
                }), r.attachHandler("GameBoard", "mousemove touchmove", function (e) {
                    return w && (e.originalEvent.changedTouches && (e = e.originalEvent.changedTouches[0]), M({
                        x: e.clientX - E.x,
                        y: e.clientY - E.y
                    }) && (w = !1)), !1
                }), r.attachHandler("GameBoard", "mousedown touchstart", ".inventory .button", function (n) {
                    if (u.canMove()) {
                        n.originalEvent.changedTouches && (n = n.originalEvent.changedTouches[0]);
                        var r = e(n.target).closest(".button").data("lootName");
                        t.trigger("toggleMenu"), a.useItem(r), t.trigger("click", [r])
                    }
                    return !1
                }), r.attachHandler("GameBoard", "mousedown touchstart", ".magic .button", function (n) {
                    return n.originalEvent.changedTouches && (n = n.originalEvent.changedTouches[0]), t.trigger("magicClick", [e(n.target)]), t.trigger("click", ["magic"]), !1
                }), e("body").off().on("mousedown touchstart", function (e) {
                    return t.trigger("toggleMenu"), e.target.tagName == "TEXTAREA" || e.target.tagName == "A" || e.target.tagName == "INPUT" || e.target.hasAttribute("data-clickable")
                }), r.attachHandler("World", "mousedown touchstart", ".resourceBars", function (n) {
                    n.originalEvent.changedTouches && (n = n.originalEvent.changedTouches[0]), t.trigger("prioritizeBuilding", [e(n.target).closest(".resourceBars").data("building")]), t.trigger("click", ["building"])
                }), r.attachHandler("World", "mousedown touchstart", ".building.upgrading", function (n) {
                    n.originalEvent.changedTouches && (n = n.originalEvent.changedTouches[0]), t.trigger("prioritizeBuilding", [e(n.target).closest(".building").data("upgrade")]), t.trigger("click", ["building"])
                }), r.attachHandler("World", "mousedown touchstart", function (e) {
                    return e.originalEvent.changedTouches && (e = e.originalEvent.changedTouches[0]), t.trigger("toggleMenu"), !1
                })
            },
            setGraphicsCallback: function (e) {
                if (S != null) throw "Already waiting on graphics!";
                S = e
            },
            isNight: function () {
                return u.isNight()
            },
            isSilent: function () {
                return T
            },
            isStarted: function () {
                return N
            },
            _debug: function (t) {
                e("#debug").text(t)
            }
        };
    return j
}), require(["app/engine"], function (e) {
    e.init()
}), define("app/main", function () {}), requirejs.config({
    baseUrl: "js/lib",
    shim: {
        "google-analytics": {
            exports: "ga"
        },
        base64: {
            exports: "Base64"
        }
    },
    paths: {
        app: "../app",
        jquery: ["../jquery.min", "jquery-2.0.3.min"],
        "google-analytics": ["", ""]
    },
    waitSeconds: 0
}), requirejs(["app/main"]), define("app", function () {});
