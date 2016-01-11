import groovy.sql.Sql


class IndexController{
	def dataSource

	def index() {

	}

	def getTestResults(){
		def testResults = rows("select id, test_name, status, execution_date, execution_duration_seconds, user from results")
		render(contentType: "application/json") {
	    testResults
		}
	}

	def getSuiteTestResults(){
		def testResults = rows("select id, test_name, status, execution_date, execution_duration_seconds, user from suite_results")
		render(contentType: "application/json") {
	    testResults
		}
	}

	def groupByTestName(){
		def testResults = rows("""
			select 
			ms.*,
			results.status as last_status,
				if(STRCMP(COALESCE(status),"success")=0,3,
					if(STRCMP(COALESCE(status),"failure")=0,2,1)
				) as order_num
			from results 
			INNER JOIN (
			    SELECT test_name,
			    MAX(execution_date) AS last_execution_date,
				GROUP_CONCAT(status) as statuses,
				GROUP_CONCAT(execution_date) as execution_dates,
				GROUP_CONCAT(user) as users,
				GROUP_CONCAT(id) as ids,
				count(id) as run_count
			    FROM results 
			    GROUP BY test_name
			  ) ms ON results.test_name = ms.test_name AND execution_date = last_execution_date
			where results.test_name like '%${params.search}%'
			order by ${params.orderBy} ${params.orderByReverse}
			limit ${params.offset as int},${params.chuckSize as int};
		""")

		render(contentType: "application/json") {
			testResults
		}
	}

	def getSingleTestInfo(){
		def testResults = new Sql(dataSource).firstRow("select * from results where id=${params.id}")
		render(contentType: "application/json") {
			testResults
		}
	}

	def getSingleSuiteInfo(){
		def suiteResults = new Sql(dataSource).firstRow("select * from suite_results where id=${params.id}")
		render(contentType: "application/json") {
			suiteResults
		}
	}

	def getTestRunsForSuite(){
		def testResults = rows("select * from results where suite_id=${params.id}")
		render(contentType: "application/json") {
			testResults
		}		
	}

	def getSuiteHistory(){
		def sql = new Sql(dataSource);
		sql.execute 'SET Session group_concat_max_len = 1000000;'
		def suiteResults = sql.rows("""
			select 
			ms.*,
			suite_results.status as last_status,
				if(STRCMP(COALESCE(status),"success")=0,3,
					if(STRCMP(COALESCE(status),"failure")=0,2,1)
				) as order_num
			from suite_results 
			INNER JOIN (
				SELECT test_name,
				MAX(execution_date) AS last_execution_date,
				GROUP_CONCAT(IFNULL(status, 'NULL')) as statuses,
				GROUP_CONCAT(execution_date) as execution_dates,
				GROUP_CONCAT(user) as users,
				GROUP_CONCAT(id) as ids,
				count(id) as run_count
				FROM suite_results 
				where status is not null
				GROUP BY test_name
			  ) ms ON suite_results.test_name = ms.test_name AND execution_date = last_execution_date

			where suite_results.test_name like '%${params.search}%'
			order by ${params.orderBy} ${params.orderByReverse}
			limit ${params.offset as int},${params.chuckSize as int};
			""".toString())

		render(contentType: "application/json") {
			suiteResults
		}
	}

	def redirectToMain(){
		redirect(controller: "index", action: "index")
	}

	def rows = { query ->
		def sql = new Sql(dataSource)
		def rows = sql.rows(query.toString())
	}
}