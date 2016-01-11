    class UrlMappings {

    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(redirect:"/index/index")
        "500"(view:'/error')
        "404"(controller: "index", action: "redirectToMain")
    }
}
