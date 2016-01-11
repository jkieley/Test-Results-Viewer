@GrabConfig(systemClassLoader = true)
@Grab('mysql:mysql-connector-java:5.1.36')
import groovy.sql.Sql

def db = [url:'jdbc:mysql://qametrics.ci3med2bivdy.us-west-1.rds.amazonaws.com:3306/test_results', user:'root', password:'suw4Ekaq', driver:'com.mysql.jdbc.Driver']
 def sql = Sql.newInstance(db.url, db.user, db.password, db.driver)
 
sql.eachRow("select id from suite_results;",{ suite ->
    println "suite.id: "+suite.id
    def tests = sql.rows("""
    select 
      GROUP_CONCAT(status) as statuses
    from results 
    where suite_id=${suite.id}
    group by suite_id;    
    """.toString())
    if(tests[0]){
        def statuses = tests[0].statuses
        println statuses
        def suiteStatus = "success"
        if(statuses.contains("failure")){
            suiteStatus = "failure"
        }
        if(statuses.contains("error")){
            suiteStatus = "error"
        }
        println suiteStatus
         sql.executeUpdate "update suite_results set status=$suiteStatus where id=$suite.id"
    }else{
        println "suite has no runs"+suite.id
    }
 })