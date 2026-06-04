import { Filter, Search, Users } from 'lucide-react';
import { 
  Container, 
  Panel, 
  Input, 
  InputGroup, 
  SelectPicker, 
  Loader, 
  Badge, 
  Grid, 
  Row, 
  Col, 
  Placeholder 
} from 'rsuite';
import { Icon } from 'rsuite';


const { Paragraph } = Placeholder;

export default function RecruiterAnalysisSkeleton() {
  return (
    <Container style={{ padding: 24 }}>
      {/* API Status Banner */}
      <Panel bordered style={{ background: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Loader size="xs" />
          <span style={{ fontWeight: 500, color: '#1e40af' }}>Loading recruiters...</span>
        </div>
      </Panel>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <InputGroup inside style={{ maxWidth: 350 }}>
          <Input placeholder="Search recruiters by name, email, or team..." />
          <InputGroup.Addon>
            
              <Search className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </InputGroup.Addon>
        </InputGroup>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users className="h-4 w-4 text-muted-foreground" />
          <SelectPicker
            data={[]}
            placeholder="All Teams"
            style={{ width: 180 }}
            cleanable={false}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <SelectPicker
            data={[]}
            placeholder="Active (0)"
            style={{ width: 160 }}
            cleanable={false}
          />
        </div>

        <Badge content="Showing: 0" style={{ padding: '6px 12px', color: '#1e3a5f', border: '1px solid #1e3a5f' }} />
      </div>

      {/* Skeleton Grid */}
      <Grid fluid>
        <Row gutter={16}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} md={12} lg={8}>
              <Panel bordered style={{ background: '#fff', marginBottom: 16 }}>
                <Placeholder.Graph active height={20} />
                <Paragraph rows={3} active />
              </Panel>
            </Col>
          ))}
        </Row>
      </Grid>
    </Container>
  );
}
