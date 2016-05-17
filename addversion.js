import com.atlassian.jira.component.ComponentAccessor
import com.atlassian.jira.issue.search.SearchProvider
import com.atlassian.jira.jql.parser.JqlQueryParser
import com.atlassian.jira.web.bean.PagerFilter
import java.util.List;
import com.atlassian.jira.ComponentManager;
import com.atlassian.jira.project.version.Version;
import com.atlassian.jira.project.version.VersionManager;
import com.atlassian.jira.event.type.EventDispatchOption;

def jqlQueryParser = ComponentAccessor.getComponent(JqlQueryParser)
def searchProvider = ComponentAccessor.getComponent(SearchProvider)
def issueManager = ComponentAccessor.getIssueManager()
def user = ComponentAccessor.getJiraAuthenticationContext().getUser()
def userUtil = ComponentAccessor.getUserUtil()
def botUser = userUtil.getUserObject("username")
def issueIndexManager = ComponentManager.getInstance().getIndexManager();
VersionManager vm = ComponentManager.getInstance().getVersionManager();


// edit this query to suit
def query = jqlQueryParser.parseQuery("(project = PROJECTNAME) AND fixVersion = RELEASE_TRAIN_FIXVERSION  AND fixVersion != PREVIOUS_FIXVERSION1 and fixVersion != PREVIOUS_FIXVERSION2 and fixVersion != PREVIOUS_FIXVERSION3 and fixVersion != PREVIOUS_FIXVERSION4 and status in (QA, Resolved, Closed) AND updatedDate > 2016-05-8")

def results = searchProvider.search(query, user, PagerFilter.getUnlimitedFilter())

String output = "Total issues: ${results.total}<br/>";
List vList = null;

results.getIssues().each {documentIssue ->
   // output += "${documentIssue.key}: "

    // if you need a mutable issue you can do:
    def issue = issueManager.getIssueObject(documentIssue.id)
    Collection<Version> issueFixVersions = issue.getFixVersions();
         
    // do something to the issue...
    issueFixVersions.add(vm.getVersion(NEW_FIXVERSION_ID));
   // output += "${issue.fixVersions}</br>";
//    output += "${issueFixVersions}</br>";
    issue.setFixVersions(issueFixVersions);
    issue.store();
    def newIssue = issueManager.updateIssue(botUser, issue, EventDispatchOption.ISSUE_UPDATED, true)
    issueIndexManager.reIndex(newIssue);
    
    //issueManager.updateIssue(botUser, issue, EventDispatchOption.DO_NOT_DISPATCH, false)

}
 return output;

